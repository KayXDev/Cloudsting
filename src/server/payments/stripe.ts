import Stripe from "stripe";
import { env } from "@/server/env";

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY). ");
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}
