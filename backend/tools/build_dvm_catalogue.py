"""Build backend/app/scripts/dvm_catalogue.json and copy the chosen photos from the DVM-CAR dataset.

Run once by hand (the dataset is not in the repo):
    python -I backend/tools/build_dvm_catalogue.py <DVM-CAR folder>

DVM-CAR (Huang, Chen, Luo, Yue, Ounis, 2022) is licensed CC BY-NC 4.0: non-commercial use, with credit.
Its prices are historical UK prices in pounds; they are converted at a fixed, labelled rate.
"""
import csv
import io
import json
import random
import sys
import zipfile
from pathlib import Path

GBP_TO_INR = 105  # fixed demo rate, not a live one
ROUND_TO_RUPEES = 1_000

# Genmodel_ID -> category. Chosen by hand: the dataset has no body-type column.
PICKS = {
    "SEDAN": ["7_5", "8_5", "59_12", "59_20", "59_29", "95_20", "39_7", "96_4", "57_13", "29_27"],
    "HATCHBACK": ["7_3", "29_13", "29_14", "95_15", "95_22", "92_44", "34_2", "75_2", "69_12", "36_9"],
    "SUV": ["64_33", "43_13", "36_24", "29_25", "47_13", "57_7", "34_3", "92_34", "96_16", "8_39",
            "7_20", "40_1", "71_10", "47_14"],
    "COUPE": ["71_4", "7_46", "64_13", "29_28", "39_3", "6_2", "10_5", "45_4", "58_4", "27_7", "92_17",
              "8_28"],
    "CONVERTIBLE": ["57_15", "8_45", "71_2", "59_30", "94_7", "95_13", "59_32"],
    "VAN": ["29_19", "95_24", "59_36", "94_24", "95_11", "29_34", "75_9"],
}


def read(zf: zipfile.ZipFile, name: str):
    with zf.open(name) as raw:
        yield from csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig", errors="replace"))


def main(dvm: Path, repo: Path) -> None:
    category = {gid: cat for cat, ids in PICKS.items() for gid in ids}
    tables = zipfile.ZipFile(dvm / "tables_V2.0.zip")
    fronts = zipfile.ZipFile(dvm / "Confirmed_fronts.zip")
    in_zip = {n for n in fronts.namelist() if n.endswith(".jpg")}

    latest: dict[str, tuple[int, str, str, int]] = {}  # gid -> (year, maker, model, gbp)
    for r in read(tables, "Price_table.csv"):
        gid = r["Genmodel_ID"]
        if gid in category and int(r["Year"]) >= latest.get(gid, (0,))[0]:
            latest[gid] = (int(r["Year"]), r["Maker"], r["Genmodel"], int(r["Entry_price"]))

    photo: dict[str, str] = {}  # gid -> newest photo; every file in Confirmed_fronts is a checked front view
    for path in in_zip:
        parts = path.rsplit("/", 1)[-1].split("$$")
        gid = parts[4] if len(parts) > 4 else ""
        if gid in category and (gid not in photo or path > photo[gid]):
            photo[gid] = path

    rng = random.Random(2022)
    images = repo / "frontend" / "public" / "images" / "vehicles"
    missing = sorted(set(category) - set(photo))
    if missing:
        sys.exit(f"no confirmed front photo for: {missing}")
    out = []
    for gid in sorted(category, key=lambda g: (category[g], latest[g][1], latest[g][2])):
        year, maker, model, gbp = latest[gid]
        slug = f"dvm-{maker}-{model}".lower().replace(" ", "-").replace("'", "")
        (images / f"{slug}.jpg").write_bytes(fronts.read(photo[gid]))
        rupees = round(gbp * GBP_TO_INR / ROUND_TO_RUPEES) * ROUND_TO_RUPEES
        out.append({"make": maker, "model": model, "category": category[gid], "year": year,
                    "price_cents": rupees * 100, "quantity": rng.choice([0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 8]),
                    "image_url": f"/images/vehicles/{slug}.jpg"})
    target = repo / "backend" / "app" / "scripts" / "dvm_catalogue.json"
    target.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(out)} vehicles -> {target}")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(__file__).resolve().parents[2])
