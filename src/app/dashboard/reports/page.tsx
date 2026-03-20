import { Megaphone } from "lucide-react";
import ReportTable from "./components/ReportTable";

export default function ReportsPage() {
  const title = "B\u00e1o c\u00e1o qu\u1ea3n tr\u1ecb";
  const description =
    "Xem x\u00e9t v\u00e0 x\u1eed l\u00fd c\u00e1c b\u00e1o c\u00e1o li\u00ean quan \u0111\u1ebfn ng\u01b0\u1eddi d\u00f9ng v\u00e0 \u0111\u1ed1i t\u00e1c d\u1ecbch v\u1ee5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <ReportTable />
    </div>
  );
}
