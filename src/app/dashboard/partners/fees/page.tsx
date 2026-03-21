import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function ServicePartnerFeesPage() {
  redirect(ROUTES.SUBSCRIPTIONS_PARTNERS);
}
