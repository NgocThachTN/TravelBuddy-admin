import Link from "next/link";
import { ArrowRight, FileSearch, Handshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import PartnerRequestsTable from "./components/PartnerRequestsTable";
import ServicePartnersTable from "./components/ServicePartnersTable";

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý đối tác dịch vụ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi hồ sơ đăng ký đối tác và danh sách đối tác dịch vụ đã được phê duyệt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={ROUTES.PARTNER_REQUESTS}>
              Hồ sơ cần duyệt
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.ACTIVE_PARTNERS}>
              Đối tác đang hợp tác
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="h-4 w-4 text-primary" />
              Hồ sơ đăng ký đối tác
            </CardTitle>
            <CardDescription>
              Danh sách hồ sơ đăng ký đối tác để quản trị viên xem và phê duyệt.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Bao gồm danh sách, trang chi tiết, phê duyệt, từ chối và yêu cầu bổ sung hồ sơ.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Đối tác dịch vụ đang hoạt động
            </CardTitle>
            <CardDescription>
              Danh sách đối tác đang hợp tác, kèm chi tiết hồ sơ, thông tin liên hệ và địa chỉ.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Dữ liệu được lấy trực tiếp từ endpoint `admin/service-partners` của backend.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Hồ sơ đăng ký đối tác mới nhất
          </CardTitle>
          <CardDescription>
            Xem nhanh các request mới nhất và mở chi tiết để duyệt từng hồ sơ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerRequestsTable compact />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Đối tác dịch vụ đang hoạt động
          </CardTitle>
          <CardDescription>
            Danh sách đối tác đã được duyệt và đang hợp tác trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicePartnersTable compact />
        </CardContent>
      </Card>
    </div>
  );
}
