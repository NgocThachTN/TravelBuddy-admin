import { Shield } from "lucide-react";
import ModerationReportTable from "./components/ModerationReportTable";
import ModerationReportsQuickTabs from "./components/ModerationReportsQuickTabs";

export default function ModerationReportsPage() {
  const title = "B\u00e1o c\u00e1o n\u1ed9i dung";
  const description =
    "Xem x\u00e9t v\u00e0 x\u1eed l\u00fd c\u00e1c b\u00e1o c\u00e1o v\u1ec1 chuy\u1ebfn \u0111i, tin nh\u1eafn chuy\u1ebfn \u0111i, b\u00e0i vi\u1ebft, b\u00ecnh lu\u1eadn, y\u00eau c\u1ea7u c\u1ee9u h\u1ed9, tin nh\u1eafn c\u1ee9u h\u1ed9 v\u00e0 checkpoint x\u00e3 h\u1ed9i";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <ModerationReportsQuickTabs />
      <ModerationReportTable />
    </div>
  );
}
