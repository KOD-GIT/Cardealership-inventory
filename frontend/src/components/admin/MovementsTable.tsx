import type { MovementRecord } from "../../data/stores";
import { formatDateTime } from "../../lib/format";

const EVENT_STYLE: Record<MovementRecord["event"], string> = {
  PURCHASED: "text-lime", RESTOCKED: "text-lime", CREATED: "text-bone", UPDATED: "text-dim", DELETED: "text-signal",
};

const signed = (delta: number) => (delta > 0 ? `+${delta}` : String(delta));

/**
 * Stock movements recorded by THIS application on THIS device (purchases, restocks and inventory edits). It is
 * not a server audit log: movements made elsewhere are not here, and the data is demonstration-grade.
 */
export function MovementsTable({ movements, showVehicle = true, empty }: { movements: MovementRecord[]; showVehicle?: boolean; empty?: string }) {
  if (movements.length === 0) {
    return <p className="border border-line bg-charcoal p-6 text-dim">{empty ?? "No stock movements have been recorded on this device yet."}</p>;
  }
  const rows = [...movements].reverse();
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">Stock movements, newest first</caption>
        <thead>
          <tr className="t-label border-b border-line bg-charcoal text-muted">
            <th scope="col" className="border-r border-line p-3 font-medium">Time</th>
            <th scope="col" className="border-r border-line p-3 font-medium">Event</th>
            {showVehicle ? <th scope="col" className="border-r border-line p-3 font-medium">Vehicle</th> : null}
            <th scope="col" className="border-r border-line p-3 font-medium">Actor</th>
            <th scope="col" className="border-r border-line p-3 text-right font-medium">Change</th>
            <th scope="col" className="p-3 text-right font-medium">Stock after</th>
          </tr>
        </thead>
        <tbody className="t-data divide-y divide-line">
          {rows.map((movement) => (
            <tr key={movement.id} className="hover:bg-charcoal">
              <td className="whitespace-nowrap border-r border-line p-3 text-dim">{formatDateTime(movement.at)}</td>
              <td className={`border-r border-line p-3 font-bold ${EVENT_STYLE[movement.event]}`}>{movement.event}</td>
              {showVehicle ? <td className="border-r border-line p-3">{movement.vehicle}</td> : null}
              <td className="border-r border-line p-3 text-dim">{movement.actor}</td>
              <td className="border-r border-line p-3 text-right font-bold">{signed(movement.delta)}</td>
              <td className="p-3 text-right">{movement.resulting ?? "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
