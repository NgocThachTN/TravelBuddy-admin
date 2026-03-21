import { redirect } from "next/navigation";

export default function PartnerRequestsRedirectPage() {
  redirect("/dashboard/partners?tab=requests");
}
