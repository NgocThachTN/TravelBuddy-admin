import { redirect } from "next/navigation";

export default function ActivePartnersRedirectPage() {
  redirect("/dashboard/partners?tab=active");
}
