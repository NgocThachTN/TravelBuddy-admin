"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchTripTypeCategories,
  createTripTypeCategories,
  updateTripTypeCategory,
} from "@/lib/api";
import type {
  TripTypeCategoryDto,
  TripTypeCategoryTypeCode,
} from "@/types";
import { TRIP_TYPE_CATEGORY_CODES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Pencil, Loader2, Compass } from "lucide-react";
import PaginationControl from "@/components/pagination-control";

const TYPE_LABELS: Record<string, string> = {
  Adventure: "Phiêu lưu",
  Relaxation: "Nghỉ dưỡng",
  Cultural: "Văn hoá",
  Touring: "Tham quan",
  Trekking: "Leo núi",
  Camping: "Cắm trại",
  Beach: "Biển",
  Ecotourism: "Sinh thái",
  FoodTour: "Ẩm thực",
  ExtremeSport: "Thể thao mạo hiểm",
  Spiritual: "Tâm linh",
  Volunteer: "Tình nguyện",
  Photography: "Nhiếp ảnh",
  MotorbikeTour: "Phượt xe máy",
  NightTour: "Tour đêm",
  Teambuilding: "Team building",
  CityExploration: "Khám phá thành phố",
  Other: "Khác",
};

export default function TripTypeCategoryTab() {
  const [categories, setCategories] = useState<TripTypeCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TripTypeCategoryDto | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TripTypeCategoryTypeCode>("Other");
  const [formIcon, setFormIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTripTypeCategories();
      setCategories(res.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setFormName("");
    setFormType("Other");
    setFormIcon("");
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(cat: TripTypeCategoryDto) {
    setEditing(cat);
    setFormName(cat.name ?? "");
    setFormType((cat.type as TripTypeCategoryTypeCode) ?? "Other");
    setFormIcon(cat.iconUrl ?? "");
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) {
      setFormError("Tên không được để trống");
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      if (editing) {
        await updateTripTypeCategory(editing.tripTypeCategoryId, {
          name: formName.trim(),
          type: formType,
          iconUrl: formIcon.trim() || undefined,
        });
      } else {
        await createTripTypeCategories({
          items: [{
            name: formName.trim(),
            type: formType,
            iconUrl: formIcon.trim() || undefined,
          }],
        });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-5 py-3.5 last:border-0">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <div className="flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && categories.length === 0) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-14">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Compass className="h-7 w-7 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive mb-1">Đã xảy ra lỗi</p>
          <p className="text-xs text-destructive/70 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <span className="text-xs text-muted-foreground">{categories.length} loại chuyến đi</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} className="h-8 gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Làm mới
            </Button>
            <Button size="sm" onClick={openCreate} className="h-8 gap-1.5">
              <Plus className="h-4 w-4" /> Thêm mới
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[60px] pl-5">ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Icon URL</TableHead>
              <TableHead className="w-[80px] text-right pr-5">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">Chưa có loại chuyến đi nào</p>
                </TableCell>
              </TableRow>
            ) : (
              categories
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((cat) => (
                  <TableRow key={cat.tripTypeCategoryId} className="group">
                    <TableCell className="pl-5 text-muted-foreground text-xs">
                      {cat.tripTypeCategoryId}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[11px]">
                        {TYPE_LABELS[cat.type ?? ""] ?? cat.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {cat.iconUrl || "—"}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <PaginationControl
          currentPage={page}
          totalPages={Math.ceil(categories.length / itemsPerPage)}
          onPageChange={setPage}
          className="border-t py-3"
        />
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa loại chuyến đi" : "Thêm loại chuyến đi"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Tên <span className="text-destructive">*</span></Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Phượt xe máy"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phân loại <span className="text-destructive">*</span></Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as TripTypeCategoryTypeCode)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_TYPE_CATEGORY_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {TYPE_LABELS[code] ?? code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Icon URL</Label>
              <Input
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="h-9">
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-9">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
