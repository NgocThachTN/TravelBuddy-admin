"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createSubscriptionPackage, updateSubscriptionPackage } from "@/lib/api";
import type { SubscriptionPackage, CreateSubscriptionPackagePayload } from "@/types";
import {
  Loader2,
  MapPin,
  Users,
  Sparkles,
  Images,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPackage?: SubscriptionPackage | null;
}

const defaultForm: CreateSubscriptionPackagePayload = {
  name: "",
  price: 0,
  durationDays: 30,
  description: "",
  isEnabled: true,
  isDefaultFree: false,
  tripCreateLimit: 0,
  tripParticipantLimit: 0,
  aiUsageLimit: 0,
  memoryPhotoUploadLimit: 1000,
};

const FREE_MEMORY_PHOTO_LIMIT = 100;
const PAID_MEMORY_PHOTO_LIMIT = 1000;

function toSafeNumber(raw: string) {
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

export default function SubscriptionForm({
  open,
  onClose,
  onSuccess,
  editingPackage,
}: Props) {
  const isEdit = !!editingPackage;
  const isEditingDefaultFree = !!editingPackage?.isDefaultFree;

  const [form, setForm] = useState<CreateSubscriptionPackagePayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPackage) {
      setForm({
        name: editingPackage.name,
        price: editingPackage.price,
        durationDays: editingPackage.durationDays,
        description: editingPackage.description ?? "",
        isEnabled: editingPackage.isEnabled,
        isDefaultFree: editingPackage.isDefaultFree,
        tripCreateLimit: editingPackage.tripCreateLimit,
        tripParticipantLimit: editingPackage.tripParticipantLimit,
        aiUsageLimit: editingPackage.aiUsageLimit,
        memoryPhotoUploadLimit: editingPackage.memoryPhotoUploadLimit,
      });
    } else {
      setForm(defaultForm);
    }
    setError(null);
  }, [editingPackage, open]);

  function setField<K extends keyof CreateSubscriptionPackagePayload>(
    key: K,
    value: CreateSubscriptionPackagePayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDefaultFreeToggle(checked: boolean) {
    if (isEditingDefaultFree && !checked) {
      setError("Không thể bỏ cờ Free mặc định tại đây. Hãy đặt gói khác làm Free mặc định trước.");
      return;
    }

    setError(null);
    setForm((prev) => ({
      ...prev,
      isDefaultFree: checked,
      price: checked ? 0 : prev.price,
      isEnabled: checked ? true : prev.isEnabled,
      memoryPhotoUploadLimit: checked
        ? FREE_MEMORY_PHOTO_LIMIT
        : Math.max(prev.memoryPhotoUploadLimit, PAID_MEMORY_PHOTO_LIMIT),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Tên gói không được để trống.");
      return;
    }

    if (form.durationDays <= 0) {
      setError("Số ngày hiệu lực phải lớn hơn 0.");
      return;
    }

    if (form.tripCreateLimit < 0 || form.tripParticipantLimit < 0 || form.aiUsageLimit < 0) {
      setError("Các giới hạn không được âm.");
      return;
    }

    if (form.memoryPhotoUploadLimit <= 0) {
      setError("Giới hạn ảnh kỷ niệm phải lớn hơn 0.");
      return;
    }

    if (form.isDefaultFree) {
      if (form.price !== 0) {
        setError("Gói Free mặc định bắt buộc có giá bằng 0.");
        return;
      }
      if (!form.isEnabled) {
        setError("Gói Free mặc định bắt buộc phải đang hoạt động.");
        return;
      }
    } else {
      if (form.price <= 0) {
        setError("Giá gói trả phí phải lớn hơn 0.");
        return;
      }
    }

    if (isEditingDefaultFree && !form.isDefaultFree) {
      setError("Không thể bỏ cờ Free mặc định tại đây. Hãy đặt gói khác làm Free mặc định trước.");
      return;
    }

    const payload: CreateSubscriptionPackagePayload = form.isDefaultFree
      ? { ...form, price: 0, isEnabled: true }
      : form;

    try {
      setLoading(true);
      if (isEdit && editingPackage) {
        await updateSubscriptionPackage(editingPackage.subscriptionPackageId, payload);
      } else {
        await createSubscriptionPackage(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">
            {isEdit ? "Cập nhật gói đăng ký" : "Tạo gói đăng ký mới"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {isEdit
              ? "Chỉnh sửa thông tin và quyền lợi của gói đăng ký"
              : "Thiết lập thông tin cơ bản và giới hạn cho gói mới"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Thông tin cơ bản
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">
                Tên gói <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: Gói Premium"
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  Giá (VND) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  disabled={form.isDefaultFree}
                  onChange={(e) => setField("price", toSafeNumber(e.target.value))}
                  className="h-9"
                />
                {form.isDefaultFree && (
                  <p className="text-[11px] text-muted-foreground">
                    Gói Free mặc định có giá cố định 0đ.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationDays" className="text-sm flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Thời hạn (ngày) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="durationDays"
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) => setField("durationDays", toSafeNumber(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-muted-foreground" />
                Mô tả
              </Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Mô tả ngắn về gói đăng ký..."
                className="resize-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Giới hạn sử dụng
            </p>
            <p className="text-[11px] text-muted-foreground/70 -mt-2">
              Nhập 0 cho tạo trip, người tham gia và AI để không giới hạn. Ảnh kỷ niệm phải lớn hơn 0.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tripCreateLimit" className="text-xs flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  Tạo trip
                </Label>
                <Input
                  id="tripCreateLimit"
                  type="number"
                  min={0}
                  value={form.tripCreateLimit}
                  onChange={(e) => setField("tripCreateLimit", toSafeNumber(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tripParticipantLimit" className="text-xs flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  Người tham gia
                </Label>
                <Input
                  id="tripParticipantLimit"
                  type="number"
                  min={0}
                  value={form.tripParticipantLimit}
                  onChange={(e) => setField("tripParticipantLimit", toSafeNumber(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aiUsageLimit" className="text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  Lượt dùng AI
                </Label>
                <Input
                  id="aiUsageLimit"
                  type="number"
                  min={0}
                  value={form.aiUsageLimit}
                  onChange={(e) => setField("aiUsageLimit", toSafeNumber(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="memoryPhotoUploadLimit" className="text-xs flex items-center gap-1.5">
                  <Images className="h-3 w-3 text-muted-foreground" />
                  Ảnh kỷ niệm
                </Label>
                <Input
                  id="memoryPhotoUploadLimit"
                  type="number"
                  min={1}
                  value={form.memoryPhotoUploadLimit}
                  onChange={(e) => setField("memoryPhotoUploadLimit", toSafeNumber(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <Label htmlFor="isDefaultFree" className="cursor-pointer text-sm font-medium">
                Gói free mặc định
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hệ thống chỉ nên có một gói Free mặc định đang hoạt động.
              </p>
            </div>
            <Switch
              id="isDefaultFree"
              checked={form.isDefaultFree}
              onCheckedChange={handleDefaultFreeToggle}
              disabled={isEditingDefaultFree}
            />
          </div>

          {isEditingDefaultFree && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              Gói này đang là Free mặc định. Muốn đổi, hãy đặt gói khác làm Free mặc định trước.
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <Label htmlFor="isEnabled" className="cursor-pointer text-sm font-medium">
                Kích hoạt ngay
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {form.isDefaultFree
                  ? "Gói Free mặc định luôn ở trạng thái hoạt động."
                  : "Gói sẽ hiển thị cho người dùng sau khi tạo."}
              </p>
            </div>
            <Switch
              id="isEnabled"
              checked={form.isEnabled}
              onCheckedChange={(v) => setField("isEnabled", v)}
              disabled={form.isDefaultFree}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-9">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo gói"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
