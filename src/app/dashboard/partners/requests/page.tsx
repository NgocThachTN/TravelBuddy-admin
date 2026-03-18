import PartnerRequestsTable from "../components/PartnerRequestsTable";

export default function PartnerRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ đối tác cần review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách hồ sơ đăng ký đối tác cho admin review.
        </p>
      </div>
      <PartnerRequestsTable />
    </div>
  );
}
