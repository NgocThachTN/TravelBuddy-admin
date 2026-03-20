import { requireAnyRole } from "@/server/auth/dal";
import TripTable from "./components/TripTable";

export default async function TripsPage() {
  const session = await requireAnyRole(["ADMIN", "MODERATOR"]);
  const title = "Qu\u1ea3n l\u00fd chuy\u1ebfn \u0111i";
  const description =
    session.role === "ADMIN"
      ? "Theo d\u00f5i v\u00e0 qu\u1ea3n l\u00fd t\u1ea5t c\u1ea3 chuy\u1ebfn \u0111i tr\u00ean n\u1ec1n t\u1ea3ng"
      : "Theo d\u00f5i danh s\u00e1ch v\u00e0 chi ti\u1ebft c\u00e1c chuy\u1ebfn \u0111i ph\u1ee5c v\u1ee5 c\u00f4ng t\u00e1c ki\u1ec3m duy\u1ec7t";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <TripTable role={session.role} />
    </div>
  );
}
