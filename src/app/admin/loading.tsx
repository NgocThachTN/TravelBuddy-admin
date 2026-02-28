export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-xl border-[3px] border-muted border-t-primary" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Đang tải…
      </p>
    </div>
  );
}
