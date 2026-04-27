"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { fetchRescuePricingRules, updateRescuePricingRule } from "@/lib/system-rule-api";
import { extractApiError } from "@/lib/api-error";
import type { RescuePricingRules } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Message = {
  kind: "success" | "error" | "info";
  text: string;
};

const FIELD_LABELS = {
  rescue_commission_two_wheel: "Hoa hồng cứu hộ xe 2 bánh",
  rescue_commission_four_wheel: "Hoa hồng cứu hộ xe 4 bánh",
  rescue_deposit_percent: "Tỷ lệ đặt cọc cứu hộ (%)",
} as const;

interface FormValue {
  rescueCommissionTwoWheel: string;
  rescueCommissionFourWheel: string;
  rescueDepositPercent: string;
}

function toFormValue(data: RescuePricingRules): FormValue {
  return {
    rescueCommissionTwoWheel: String(data.rescueCommissionTwoWheel),
    rescueCommissionFourWheel: String(data.rescueCommissionFourWheel),
    rescueDepositPercent: String(data.rescueDepositPercent),
  };
}

function parsePositiveInteger(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export default function PartnerCommissionSettings() {
  const [form, setForm] = useState<FormValue>({
    rescueCommissionTwoWheel: "",
    rescueCommissionFourWheel: "",
    rescueDepositPercent: "",
  });
  const [original, setOriginal] = useState<FormValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const isDirty = useMemo(() => {
    if (!original) {
      return false;
    }

    return (
      form.rescueCommissionTwoWheel !== original.rescueCommissionTwoWheel
      || form.rescueCommissionFourWheel !== original.rescueCommissionFourWheel
      || form.rescueDepositPercent !== original.rescueDepositPercent
    );
  }, [form, original]);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchRescuePricingRules();
      const nextForm = toFormValue(response.data);
      setForm(nextForm);
      setOriginal(nextForm);
      setMessage(null);
    } catch (err) {
      const apiError = extractApiError(err, "Không thể tải cấu hình hoa hồng đối tác.");
      setMessage({ kind: "error", text: apiError.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  function setField<K extends keyof FormValue>(key: K, value: FormValue[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setMessage(null);

    const twoWheel = parsePositiveInteger(form.rescueCommissionTwoWheel);
    if (twoWheel === null) {
      setMessage({
        kind: "error",
        text: `${FIELD_LABELS.rescue_commission_two_wheel} phải là số nguyên dương.`,
      });
      return;
    }

    const fourWheel = parsePositiveInteger(form.rescueCommissionFourWheel);
    if (fourWheel === null) {
      setMessage({
        kind: "error",
        text: `${FIELD_LABELS.rescue_commission_four_wheel} phải là số nguyên dương.`,
      });
      return;
    }

    const depositPercent = parsePositiveInteger(form.rescueDepositPercent);
    if (depositPercent === null || depositPercent < 1 || depositPercent > 100) {
      setMessage({
        kind: "error",
        text: `${FIELD_LABELS.rescue_deposit_percent} phải là số nguyên trong khoảng 1 đến 100.`,
      });
      return;
    }

    const updates: Array<{ key: keyof typeof FIELD_LABELS; value: number }> = [];

    if (!original || twoWheel !== Number.parseInt(original.rescueCommissionTwoWheel, 10)) {
      updates.push({ key: "rescue_commission_two_wheel", value: twoWheel });
    }
    if (!original || fourWheel !== Number.parseInt(original.rescueCommissionFourWheel, 10)) {
      updates.push({ key: "rescue_commission_four_wheel", value: fourWheel });
    }
    if (!original || depositPercent !== Number.parseInt(original.rescueDepositPercent, 10)) {
      updates.push({ key: "rescue_deposit_percent", value: depositPercent });
    }

    if (updates.length === 0) {
      setMessage({ kind: "info", text: "Không có thay đổi để lưu." });
      return;
    }

    setIsSaving(true);
    try {
      for (const update of updates) {
        try {
          await updateRescuePricingRule({
            key: update.key,
            value: String(update.value),
          });
        } catch (err) {
          const apiError = extractApiError(err, "Không thể cập nhật system rule.");
          setMessage({
            kind: "error",
            text: `Không thể cập nhật ${FIELD_LABELS[update.key]}: ${apiError.message}`,
          });
          return;
        }
      }

      await loadRules();
      setMessage({ kind: "success", text: "Cập nhật chính sách hoa hồng thành công." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoa hồng đối tác cứu hộ</CardTitle>
        <CardDescription>
          Cập nhật mức phí hoa hồng cho đơn cứu hộ và tỷ lệ đặt cọc áp dụng cho người dùng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rescueCommissionTwoWheel">{FIELD_LABELS.rescue_commission_two_wheel}</Label>
            <div className="relative">
              <Input
                id="rescueCommissionTwoWheel"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={form.rescueCommissionTwoWheel}
                onChange={(event) => setField("rescueCommissionTwoWheel", event.target.value)}
                disabled={isLoading || isSaving}
                className="pr-14"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
                VND
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescueCommissionFourWheel">{FIELD_LABELS.rescue_commission_four_wheel}</Label>
            <div className="relative">
              <Input
                id="rescueCommissionFourWheel"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={form.rescueCommissionFourWheel}
                onChange={(event) => setField("rescueCommissionFourWheel", event.target.value)}
                disabled={isLoading || isSaving}
                className="pr-14"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
                VND
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:max-w-sm">
          <Label htmlFor="rescueDepositPercent">{FIELD_LABELS.rescue_deposit_percent}</Label>
          <div className="relative">
            <Input
              id="rescueDepositPercent"
              type="number"
              min={1}
              max={100}
              step={1}
              inputMode="numeric"
              value={form.rescueDepositPercent}
              onChange={(event) => setField("rescueDepositPercent", event.target.value)}
              disabled={isLoading || isSaving}
              className="pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {message && (
          <p
            className={
              message.kind === "success"
                ? "text-sm text-emerald-600"
                : message.kind === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
            }
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadRules()}
            disabled={isLoading || isSaving}
          >
            {isLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <RefreshCw className="mr-2 h-4 w-4" />}
            Tải lại
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isLoading || isSaving || !isDirty}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
