/* Page copy and lists, ported from the Vektor Signal prototype. CMS candidates. */
import type { CityName } from "./map-data";

export type EquipKey = "van" | "reefer" | "flat" | "ltl" | "imx" | "ded";

export const EQUIP_LABEL: Record<EquipKey, string> = {
  van: "Dry Van", reefer: "Reefer", flat: "Flatbed", ltl: "LTL", imx: "Intermodal", ded: "Dedicated",
};

/** Sample lanes shown on the hero and carrier maps. Illustrative, not live data. */
export const SAMPLE_LANES: [CityName, CityName, EquipKey][] = [
  ["Salinas", "Chicago", "reefer"], ["Monterey", "Seattle", "reefer"], ["Fresno", "Dallas", "van"], ["Yakima", "Los Angeles", "reefer"],
  ["Fontana", "Houston", "van"], ["Stockton", "Denver", "flat"], ["Salinas", "New York", "reefer"], ["Fontana", "Atlanta", "van"],
  ["Wenatchee", "Minneapolis", "reefer"], ["Tacoma", "Salt Lake City", "imx"], ["Lakewood Ranch", "Charlotte", "van"], ["Miami", "Philadelphia", "reefer"],
  ["Dallas", "Nashville", "ltl"], ["Phoenix", "Kansas City", "van"], ["Los Angeles", "Las Vegas", "ded"], ["Chicago", "Columbus", "ltl"],
  ["Memphis", "Atlanta", "van"], ["Pleasanton", "Boise", "flat"], ["Albuquerque", "Houston", "imx"],
];

export type Service = { id: string; code: string; eq: EquipKey; name: string; img: string; img2: string; tl: string; body: string };

export const SERVICES: Service[] = [
  { id: "truckload", code: "TL", eq: "van", name: "Truckload", img: "svc-truckload", img2: "svc-truckload-2", tl: "Point-to-point, full trailer, on time.", body: "Dry van, reefer or flatbed. Our carrier network moves full loads point-to-point with dedicated support and real-time tracking, so your supply chain keeps moving and you always know where things stand." },
  { id: "ltl", code: "LTL", eq: "ltl", name: "Less-than-Truckload", img: "svc-ltl", img2: "svc-ltl-2", tl: "Pay for the space you use.", body: "Shipping smaller quantities? Share trailer space with other freight instead of paying for a whole truck. You cut cost without giving up service." },
  { id: "cold", code: "RFR", eq: "reefer", name: "Cold Chain", img: "svc-cold", img2: "svc-cold-2", tl: "Produce is where we grew up.", body: "Temperature-controlled transport for fresh produce, food and beverage, with continuous monitoring and strict food-safety compliance. Keeping the chain cold is about equipment, and even more about expertise and vigilance." },
  { id: "drop", code: "DRP", eq: "van", name: "Drop Trailer", img: "svc-drop", img2: "svc-drop-2", tl: "Load on your schedule, not the driver’s.", body: "Trailers stay at your facility so you can load or unload when it suits you. No time pressure, less detention cost. Ideal for variable production, high volume or tight dock space." },
  { id: "imx", code: "IMX", eq: "imx", name: "Intermodal & Port", img: "svc-intermodal", img2: "svc-intermodal-2", tl: "Rail, road and sea, stitched together.", body: "Containerized freight across modes: port pickups, drayage, rail transfers and final-mile delivery. Our port expertise and carrier relationships keep handoffs smooth and transit times down, domestic or international." },
  { id: "ded", code: "DED", eq: "ded", name: "Dedicated", img: "svc-dedicated", img2: "svc-dedicated-2", tl: "Your fleet, without owning one.", body: "Exclusive trucks and drivers built around your operation: daily routes, seasonal capacity or long-term lanes. Consistent service and control, without the overhead of running a fleet." },
  { id: "yard", code: "YRD", eq: "van", name: "Yard Management", img: "svc-yard", img2: "svc-yard-2", tl: "Turn the yard into an advantage.", body: "Trailer movements, dock scheduling and equipment coordinated from check-in to departure. Faster turns, better visibility, lower operating cost." },
];

/* TODO(vektor): confirm each quote is approved for public use. */
export const TESTIMONIALS = [
  { q: "They respond quickly and are always willing to find a solution to any problem.", w: "Retail Account Manager · Stone Fruit Shipper" },
  { q: "Very committed to great customer service, and in the produce industry that’s key for us. Their on-time record has been great.", w: "Transportation Manager · Fresh Vegetable Shipper" },
  { q: "Competitive rates and exceptional service. Easy to work with from start to finish.", w: "Retail Salesperson · Grape Shipper" },
];

export const STORY = [
  { img: "contact-promo", n: "01 · Quote", h: "Tell a person what’s moving.", p: "No portal maze. A Vektor rep scopes your lane, equipment and timing, and comes back fast with options that fit.", c: ["24/7 support", "Offices on both coasts"], mi: 0 },
  { img: "adv-safe", n: "02 · Match", h: "The right carrier, vetted.", p: "Fraud and cargo theft are rising, so compliance is non-negotiable. Every carrier partner is set up, monitored and held to strict standards before they touch your freight.", c: ["Carrier compliance", "Performance history"], mi: 0.2 },
  { img: "svc-drop", n: "03 · Pickup", h: "On your schedule.", p: "Drop trailers, dock appointments and yard coordination planned around how your facility actually runs.", c: ["Drop trailer", "Yard management"], mi: 0.35 },
  { img: "adv-tracking", n: "04 · In transit", h: "Never ask “where’s the truck?”", p: "Tracked through Project44, FourKites and MacroPoint, with a TMS connected to 20+ GPS providers. And drivers we actually talk to, so you get the story, not just a dot.", c: ["Project44", "FourKites", "MacroPoint"], mi: 0.7 },
  { img: "hero-1", n: "05 · Delivered", h: "On time. Then again tomorrow.", p: "On-time delivery and communication are the standard we commit to daily. The goal isn’t one good load, it’s a partnership that keeps working.", c: ["On-time delivery", "Long-term partnerships"], mi: 1 },
];

export const PROOF = [
  "24/7 customer support",
  "Net 20 & Quick Pay for carriers",
  "Tracked with Project44 · FourKites · MacroPoint",
  "Best of 2026 · Logistics Service",
  "Western Growers member",
  "California Fresh Fruit Association member",
  "Offices on both coasts",
  "MC 1298051 · USDOT 3705151",
];

export const PARTNERSHIPS = [
  { code: "DED", h: "Dedicated fleet", p: "Trucks and drivers committed to your lanes and your schedule, sized to your volume and flexed with your season." },
  { code: "MTS", h: "Managed transportation", p: "Hand us the whole network: carrier procurement, tendering, tracking, freight audit and reporting, run as an extension of your team." },
  { code: "RFP", h: "Contract & RFP freight", p: "Committed capacity at agreed rates across your bid lanes, with performance reporting you can take to your next review." },
  { code: "PRD", h: "Seasonal produce programs", p: "Harvest-season capacity planned months ahead, from the Salinas Valley and Central Valley to the Northwest and Florida." },
  { code: "XB", h: "Cross-border", p: "Coordinated moves into and out of Mexico and Canada with partners who know the crossings and the paperwork." },
  { code: "AGT", h: "Strategic & agent partners", p: "Agents, brokers and logistics companies who want Vektor’s carrier network, technology and back office behind their book." },
];
