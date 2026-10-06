import { Pending, PortalHead } from "@/components/team/ui";
import { requireTeamUser } from "@/lib/team";

/* Planned: list of website quote requests (VKQ-…) with status, owner and Turvo link. */
const COLS = ["Quote ID", "Received", "Lane", "Mode · trailer", "Company", "Owner", "Status"];

export default async function Quotes() {
  await requireTeamUser();
  return (
    <main>
      <PortalHead tag="Sales" title="Quote requests" />
      <div className="tcard">
        <table className="ttable">
          <thead><tr>{COLS.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody><tr><td colSpan={COLS.length}><Pending title="No lead store connected" source="lead store + Turvo">Requests from the website quote builder and the AI agent will appear here with status (new → quoted → won / lost), the rep who owns them, and a link to the Turvo shipment once one is created.</Pending></td></tr></tbody>
        </table>
      </div>
    </main>
  );
}
