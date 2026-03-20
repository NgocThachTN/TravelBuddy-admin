import PartnerRequestsTable from "../components/PartnerRequestsTable";

export default function PartnerRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ đối tác cần duyệt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách hồ sơ đăng ký đối tác dành cho quản trị viên duyệt.
        </p>
      </div>
      <PartnerRequestsTable />
    </div>
  );
}
