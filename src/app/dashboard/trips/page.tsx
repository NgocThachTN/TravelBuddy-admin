import TripTable from "./components/TripTable";

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý chuyến đi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi và quản lý tất cả chuyến đi trên nền tảng
        </p>
      </div>

      <TripTable />
    </div>
  );
}
