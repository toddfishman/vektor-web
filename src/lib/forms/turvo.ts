/*
  Quote request → Turvo shipment fields (from research/Website_Build_Handoff.md).
  Turvo's API has no quote endpoint today, so this payload rides along to email/CRM.
  When a Turvo write path exists, this is the function to send.

  Left out on purpose (Vektor fills after): account owners, status, broker, operator,
  carrier/contact, costs, DAT/ITS postings, offers, planned/actual dates, tracking
  provider, visibility groups, system tags, carrier PRO.
  OPEN QUESTION: where temperature and accessorials live in Vektor's Turvo setup;
  both are sent under itemMetrics/tags below until that's confirmed.
*/
import type { Quote } from "./schemas";

const MODE: Record<Quote["mode"], { mode: string; shipmentType: string }> = {
  ftl: { mode: "TL", shipmentType: "Full truckload" },
  partial: { mode: "TL", shipmentType: "Partial" },
  ltl: { mode: "LTL", shipmentType: "LTL" },
  imx: { mode: "Intermodal", shipmentType: "Intermodal" },
  dray: { mode: "Drayage", shipmentType: "Drayage" },
  ded: { mode: "TL", shipmentType: "Dedicated" },
};

export const EQUIP_NAME: Record<string, string> = {
  van: "Dry van", reefer: "Reefer", flat: "Flatbed", step: "Step deck", power: "Power only",
  any: "Trailer TBD", c20: "20′ container", c40: "40′ container", c40h: "40′ HC container",
};

export const ACC_NAME: Record<string, string> = {
  liftp: "Liftgate at pickup", liftd: "Liftgate at delivery", resi: "Residential", inside: "Inside delivery",
  limited: "Limited access", appt: "Appointment needed", team: "Team drivers", assist: "Driver assist",
  tarp: "Tarps", straps: "Extra straps / chains", oversize: "Over-dimensional",
};

export function toTurvo(q: Quote, quoteId: string) {
  return {
    quoteId,
    originLocation: { text: q.origin, type: q.originType || undefined },
    destinationLocation: { text: q.destination, type: q.destinationType || undefined },
    additionalLocations: q.stops.map((s) => ({ text: s })), // "2nd location"
    ...MODE[q.mode],
    equipmentNeeded: q.equipment ? EQUIP_NAME[q.equipment] : undefined,
    itemNames: [q.commodity],
    itemMetrics: {
      weightLb: q.weightLb,
      dimsIn: q.dims.l ? { l: q.dims.l, w: q.dims.w, h: q.dims.h } : undefined,
      freightClass: q.freightClass || undefined,
      stackable: q.mode === "ltl" ? q.stackable : undefined,
      temperatureF: q.tempF || undefined,
      reeferMode: q.equipment === "reefer" ? q.reeferMode : undefined,
      hazmat: q.hazmat ? { unNumber: q.unNumber, hazardClass: q.hazardClass } : undefined,
    },
    items: q.handlingUnits ? { count: q.handlingUnits, handlingQuantityUnit: q.handlingUnitType || undefined } : undefined,
    requestedPickupDate: q.pickupDate,
    requestedDeliveryDate: q.deliverBy || undefined,
    tags: q.accessorials.map((a) => ACC_NAME[a]),
    customerPurchaseOrder: q.po || undefined,
    customerReference: q.reference || undefined,
    customerOrder: q.orderNo || undefined,
    customerBid: q.targetRate || undefined,
    customer: q.company,
    customerContact: { name: q.name, email: q.email, phone: q.phone || undefined },
    container: q.mode === "dray" ? {
      containerId: q.dray.containerId, bookingIdOrMbol: q.dray.bookingOrBol, steamshipLine: q.dray.steamshipLine,
      port: q.dray.port, lastFreeDay: q.dray.lastFreeDay, earliestReturnOrCutoff: q.dray.emptyReturnBy,
    } : undefined,
    // not Turvo fields, but the rep needs them
    recurring: q.frequency === "rec" ? `${q.loadsPer || "?"} ${q.loadsPeriod}` : undefined,
    declaredValue: q.declaredValue || undefined,
    notes: q.notes || undefined,
  };
}
