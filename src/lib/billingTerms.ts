export type BillingInterval = "week" | "month" | "quarter" | "year";

export type TermPricing = {
  interval: BillingInterval;
  label: string;
  subLabel: string;
  totalMonths: number;
  // 0.10 means 10% off
  discountRate: number;
};

// Defaults:
// - quarter: 5% off prepaid 3 months
// - year: 2 months free (pay 10 months)
export const TERMS: TermPricing[] = [
  {
    interval: "week",
    label: "Weekly",
    subLabel: "Flexible start",
    totalMonths: 0.25,
    discountRate: 0,
  },
  {
    interval: "month",
    label: "Monthly",
    subLabel: "Pay monthly",
    totalMonths: 1,
    discountRate: 0,
  },
  {
    interval: "quarter",
    label: "3 months",
    subLabel: "Save 5%",
    totalMonths: 3,
    discountRate: 0.05,
  },
  {
    interval: "year",
    label: "Yearly",
    subLabel: "2 months free",
    totalMonths: 12,
    // 2 months free => 10/12 = 16.666...% off
    discountRate: 2 / 12,
  },
];

export function getTerm(interval: BillingInterval): TermPricing {
  const found = TERMS.find((t) => t.interval === interval);
  if (!found) throw new Error(`Unknown interval: ${interval}`);
  return found;
}

export function subtotalCentsForInterval(priceMonthlyCents: number, interval: BillingInterval): number {
  const term = getTerm(interval);
  return Math.round(priceMonthlyCents * term.totalMonths);
}

export function totalCentsForInterval(priceMonthlyCents: number, interval: BillingInterval): number {
  const term = getTerm(interval);
  const subtotal = subtotalCentsForInterval(priceMonthlyCents, interval);
  return Math.round(subtotal * (1 - term.discountRate));
}

export function stripeRecurringForInterval(interval: BillingInterval): {
  interval: "week" | "month" | "year";
  interval_count?: number;
} {
  if (interval === "week") return { interval: "week" };
  if (interval === "quarter") return { interval: "month", interval_count: 3 };
  if (interval === "year") return { interval: "year" };
  return { interval: "month" };
}
