"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createServicePartnerFee,
  updateServicePartnerFee,
} from "@/lib/api";
import type {
  CreateServicePartnerFeePayload,
  ServicePartnerFee,
} from "@/types";
import { Calendar, DollarSign, FileText, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingFee?: ServicePartnerFee | null;
}

const defaultForm: CreateServicePartnerFeePayload = {
  feeType: "SubscriptionFee",
  feeValue: 0,
  durationUnit: "Month",
  durationValue: 1,
  note: "",
  isActive: true,
};

export default function ServicePartnerFeeForm({
  open,
  onClose,
  onSuccess,
  editingFee,
}: Props) {
  const isEdit = !!editingFee;
  const [form, setForm] = useState<CreateServicePartnerFeePayload>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingFee) {
      setForm({
        feeType: editingFee.feeType ?? "SubscriptionFee",
        feeValue: editingFee.feeValue,
        durationUnit: editingFee.durationUnit ?? "Month",
        durationValue: editingFee.durationValue,
        note: editingFee.note ?? "",
        isActive: editingFee.isActive,
      });
    } else {
      setForm(defaultForm);
    }
    setError(null);
  }, [editingFee, open]);

  function setField<K extends keyof CreateServicePartnerFeePayload>(
    key: K,
    value: CreateServicePartnerFeePayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.feeValue <= 0) {
      setError("Giá phí phải lớn hơn 0.");
      return;
    }

    if (![1, 3, 6, 12].includes(form.durationValue)) {
      setError("Chu kỳ chỉ chấp nhận 1, 3, 6 hoặc 12.");
      return;
    }

    try {
      setLoading(true);
      if (isEdit && editingFee) {
        await updateServicePartnerFee(editingFee.servicePartnerFeeId, form);
      } else {
        await createServicePartnerFee(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu gói đối tác.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-lg">
            {isEdit ? "Cập nhật gói đối tác" : "Tạo gói đối tác mới"}
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Quản lý chu kỳ và mức phí thuê bao dành cho đối tác dịch vụ.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Thông tin cơ bản
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="feeValue" className="text-sm">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    Giá phí (VND)
                  </span>
                </Label>
                <Input
                  id="feeValue"
                  type="number"
                  min={1}
                  step={1000}
                  value={form.feeValue}
                  onChange={(e) => setField("feeValue", Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationUnit" className="text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    Đơn vị chu kỳ
                  </span>
                </Label>
                <Select
                  value={form.durationUnit}
                  onValueChange={(value) =>
                    setField("durationUnit", value as "Month" | "Year")
                  }
                >
                  <SelectTrigger id="durationUnit" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Month">Tháng</SelectItem>
                    <SelectItem value="Year">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationValue" className="text-sm">
                Chu kỳ áp dụng
              </Label>
              <Select
                value={String(form.durationValue)}
                onValueChange={(value) =>
                  setField("durationValue", Number(value))
                }
              >
                <SelectTrigger id="durationValue" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-sm">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  Ghi chú
                </span>
              </Label>
              <Textarea
                id="note"
                rows={3}
                value={form.note ?? ""}
                onChange={(e) => setField("note", e.target.value)}
                placeholder="Mô tả ngắn về gói đối tác..."
                className="resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <Label htmlFor="isActive" className="cursor-pointer text-sm font-medium">
                Kích hoạt ngay
              </Label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Gói sẽ được áp dụng và hiển thị trong danh sách hoạt động.
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.isActive ?? true}
              onCheckedChange={(value) => setField("isActive", value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-9"
          >
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
