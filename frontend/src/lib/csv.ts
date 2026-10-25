/**
 * CSV export, safe to open in a spreadsheet.
 * - Fields containing a comma, quote or newline are wrapped in quotes with inner quotes doubled (RFC 4180).
 * - A field that starts with = + - @ (or a tab/CR) is prefixed with an apostrophe so Excel/Sheets show it as
 *   text and never run it as a formula ("CSV injection"). Numbers are written plainly, so a negative number
 *   typed as a number stays a number.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";
}

/** Starts a real file download in the browser. A BOM keeps ₹ and accented names correct in Excel. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
