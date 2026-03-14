import { jsonOk } from "@/server/http";
import { clearSessionCookies } from "@/server/auth/session";

export async function POST() {
  await clearSessionCookies();
  return jsonOk({});
}
