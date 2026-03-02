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
import {
  createSubscriptionPackage,
  updateSubscriptionPackage,
  type SubscriptionPackage,
  type CreateSubscriptionPackagePayload,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

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
  tripCreateLimit: 0,
  tripParticipantLimit: 0,
  aiUsageLimit: 0,
};

export default function SubscriptionForm({
  open,
  onClose,
  onSuccess,
  editingPackage,
}: Props) {
  const isEdit = !!editingPackage;
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
        tripCreateLimit: editingPackage.tripCreateLimit,
        tripParticipantLimit: editingPackage.tripParticipantLimit,
        aiUsageLimit: editingPackage.aiUsageLimit,
      });
    } else {
      setForm(defaultForm);
    }
    setError(null);
  }, [editingPackage, open]);

  function setField<K extends keyof CreateSubscriptionPackagePayload>(
    key: K,
    value: CreateSubscriptionPackagePayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError("Tên gói không được để trống."); return; }
    if (form.price <= 0) { setError("Giá gói phải lớn hơn 0."); return; }
    if (form.durationDays <= 0) { setError("Số ngày hiệu lực phải lớn hơn 0."); return; }

    try {
      setLoading(true);
      if (isEdit && editingPackage) {
        await updateSubscriptionPackage(editingPackage.subscriptionPackageId, form);
      } else {
        await createSubscriptionPackage(form);
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật gói đăng ký" : "Tạo gói đăng ký mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên gói <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Gói Premium"
            />
          </div>

          {/* Price + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Giá (VNĐ) <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setField("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationDays">Thời hạn (ngày) <span className="text-destructive">*</span></Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => setField("durationDays", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Limits row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tripCreateLimit">Giới hạn tạo trip</Label>
              <Input
                id="tripCreateLimit"
                type="number"
                min={0}
                value={form.tripCreateLimit}
                onChange={(e) => setField("tripCreateLimit", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tripParticipantLimit">Người tham gia</Label>
              <Input
                id="tripParticipantLimit"
                type="number"
                min={0}
                value={form.tripParticipantLimit}
                onChange={(e) => setField("tripParticipantLimit", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aiUsageLimit">Lượt dùng AI</Label>
              <Input
                id="aiUsageLimit"
                type="number"
                min={0}
                value={form.aiUsageLimit}
                onChange={(e) => setField("aiUsageLimit", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả ngắn về gói đăng ký..."
            />
          </div>

          {/* IsEnabled */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <Switch
              id="isEnabled"
              checked={form.isEnabled}
              onCheckedChange={(v) => setField("isEnabled", v)}
            />
            <Label htmlFor="isEnabled" className="cursor-pointer">
              Kích hoạt ngay
            </Label>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo gói"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
