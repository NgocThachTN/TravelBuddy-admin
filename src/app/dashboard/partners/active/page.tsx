import ServicePartnersTable from "../components/ServicePartnersTable";

export default function ActivePartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Đối tác dịch vụ đang hợp tác</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách đối tác dịch vụ đang hợp tác được lấy từ backend admin API.
        </p>
      </div>
      <ServicePartnersTable />
    </div>
  );
}
