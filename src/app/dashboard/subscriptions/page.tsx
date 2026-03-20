import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function SubscriptionsPage() {
  redirect(ROUTES.SUBSCRIPTIONS_USERS);
}
