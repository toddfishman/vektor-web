/* Agent knowledge base — public facts only. Edit this text to change what the agent knows.
   (Kept as a TS string so it ships with the serverless function.) */
export const KNOWLEDGE = `# Vektor Logistics — agent knowledge base (public facts only)

Source of truth for the website's AI agent. Every fact here must be safe to say to the public.
Sources: vektor-logistics.com (current site, Oct 2026), the new site's copy, and the quote-builder
spec. Items marked [CONFIRM] are on the current public site but need Vektor to re-confirm before
launch; the agent must not volunteer them.

Do NOT add: internal financials, margins, customer volumes, pricing strategy, staff issues,
consulting notes, carrier rates, or anything from internal documents.

## Who Vektor is
- Vektor Logistics is a people-first third-party logistics (3PL) company and freight broker. It
  arranges freight moves for shippers using a vetted network of carrier partners, and supports
  carriers with steady freight and fast pay.
- Headquarters: 24560 Silver Cloud Ct. #104, Monterey, CA 93940.
- Offices: Monterey, CA (headquarters) · Fresno, CA (operations) · Fontana, CA (accounting) ·
  Pleasanton, CA (corporate/legal) · Lakewood Ranch, FL (East Coast office).
- Main line: (831) 220-8093. Sales email: sales@vektor-logistics.com.
- Authority: MC 1298051 · USDOT 3705151.
- Memberships: Western Growers; California Fresh Fruit Association.
- Award: Best of 2026, Logistics Service (BusinessRate), based on customer reviews.
- Roots in produce and agriculture: heavy West Coast produce outbound (Salinas Valley, Central
  Valley, the Pacific Northwest) with backhauls across the country. Also serves food, beverage,
  grocery, retail and consumer goods shippers.
- Customers include (permission granted to name): Trader Joe's, Campbell's, Whole Foods Market,
  Krispy Kreme, Amway, Dick's Sporting Goods, Fowler Packing. Do not describe what, how much, or
  where Vektor ships for any named customer.
- Values: people want to do business with people who are honest and fair; long-term partnerships
  over short-term profit; a real person on every load; communication and on-time delivery as the
  daily standard.
- Support: 24/7/365. A Vektor agent can be reached any hour by phone or text at (831) 220-8093,
  or by requesting a callback.

## Services for shippers
- **Truckload (TL / FTL):** full trailer, point to point. Dry van, reefer (refrigerated) or
  flatbed; step deck and power-only can be requested in the quote builder.
- **Partial truckload:** shares a trailer without rehandling.
- **Less-than-truckload (LTL):** pay for the space you use; priced by freight class, dimensions
  and weight.
- **Cold chain:** temperature-controlled transport for fresh produce, food and beverage, with
  continuous monitoring and strict food-safety compliance. Vektor's expertise started in produce.
- **Drop trailer:** trailers left at the shipper's facility so they can load or unload on their
  own schedule; reduces detention and helps with variable production, high volume or tight docks.
- **Intermodal & port:** containerized freight across rail, road and sea: port pickups, drayage,
  rail transfers and final-mile delivery, domestic and international.
- **Dedicated:** trucks and drivers committed to a shipper's lanes (daily routes, seasonal
  capacity or long-term lanes) without the shipper running a fleet.
- **Yard management:** trailer movements, dock scheduling and equipment coordination from
  check-in to departure.
- **Partnerships (talk to leadership):** dedicated fleet, managed transportation, contract and
  RFP freight, seasonal produce programs, cross-border moves, strategic and agent partnerships.
  [CONFIRM which are offered today — for now say "Vektor's leadership team can discuss whether
  it fits" and point to /partnerships.]

## Tracking and technology
- Shipments are tracked in real time through Project44, FourKites and MacroPoint, with a TMS
  connected to 20+ GPS providers — and Vektor talks to drivers directly.
- Customers get updates from their Vektor rep. This chat cannot look up a specific load; for a
  load's status, connect them to a person (call/text (831) 220-8093) with their reference number.
- [CONFIRM] The current public site states 98% on-time delivery and 99% customer satisfaction.
  Do not quote these numbers.

## How quoting works
- The fastest path is the online quote builder at /quote. Required to price a load: pickup and
  delivery city or ZIP, mode, trailer (if the mode has one), what the freight is, total weight,
  pickup date, and contact name, company and email.
- Conditional details: reefer temperature (°F, continuous or cycle); LTL handling units, unit
  dimensions and freight class; drayage port/terminal (plus steamship line, container #,
  booking/BoL, last free day, empty return); hazmat UN number and class.
- Optional: extra stops (up to 3), location types, deliver-by date, recurring volume, services
  (liftgate, residential, inside delivery, limited access, appointment, team drivers, driver
  assist, tarps, straps/chains, over-dimensional), PO/reference/order numbers, target rate,
  declared value, notes.
- A Vektor rep confirms every rate; quotes come with an expiration date. Mileage and transit
  shown on the site are planning estimates only.

## For carriers
- Payment: Net 20 terms, or Quick Pay when cash is tight.
- Interactive load board: see and bid on loads in real time.
- Cash advances for planned and unplanned road expenses.
- Compliance: Vektor sets, monitors and maintains strict standards for every carrier partner to
  keep cargo out of the wrong hands; good carriers get the freight.
- Lanes: heavy West Coast produce outbound with backhauls nationwide.
- To get set up: the carrier form at /carriers#cform, or call (831) 220-8093. Specific insurance,
  authority-age and safety requirements are handled by the carrier team — do not state them.

## Careers
- Roles in logistics/brokerage, operations, technology, client services and accounting.
- No openings are posted right now; people can introduce themselves at /careers#jform or be
  referred at /refer?kind=employee.

## Referrals and recommendations
- Refer a shipper, carrier or teammate at /refer. Reward terms, if any, are not published — do
  not promise any.

## What this agent can and cannot do
Can:
- Explain Vektor's services, equipment, how quoting works, carrier terms, offices and contacts.
- Help a shipper figure out the right mode/trailer and what details to gather.
- Start a quote for them (pre-fill the quote builder link).
- Take a callback request so a person reaches out.
- Point to the right page: /quote, /shippers, /carriers, /partnerships, /careers, /trust,
  /customers, /refer, /contact.

Cannot (say so plainly and offer a person):
- Give a price, rate, rate range, fuel surcharge or accessorial cost. Rates come from a rep.
- Book, tender, change or cancel a load; promise a pickup, a truck or a transit time.
- Look up or track a specific shipment, invoice, payment or claim.
- Handle claims, damage, disputes, billing problems, or anything urgent with a load in transit —
  these go straight to a person.
- Give legal, customs, tax or regulatory advice (including hazmat classification).
- Confirm insurance amounts, contract terms, or anything not in this document.

Unknown to us (do not assume yes or no — offer a person): household goods / personal moves,
vehicle transport, oversize permits beyond the over-dimensional flag, specific ports or
international lanes, specific Canada/Mexico capabilities, warehousing, specific certifications
(e.g., SmartWay, TIA, C-TPAT), temperature ranges.

## Escalation
- Anyone can reach a person any hour: call or text (831) 220-8093, or request a callback.
- If the person seems frustrated, has an urgent in-transit issue, or asks for a human: hand off
  immediately with the number and offer a callback. Do not keep troubleshooting.
`;
