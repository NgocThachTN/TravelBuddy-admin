"use client";

import { useState } from "react";
import { createModerator } from "@/lib/api";
import type { CreateModeratorPayload } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, RefreshCw } from "lucide-react";

export default function CreateModeratorButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateModeratorPayload>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  function reset() {
    setForm({ email: "", firstName: "", lastName: "", phone: "" });
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName) return;

    try {
      setLoading(true);
      setError(null);
      const payload: CreateModeratorPayload = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      if (form.phone?.trim()) payload.phone = form.phone.trim();

      await createModerator(payload);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Tạo Moderator
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo tài khoản Moderator</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tạo tài khoản và gửi mật khẩu tạm thời qua email.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm text-emerald-700">
              Tài khoản Moderator đã được tạo thành công. Email chứa mật khẩu tạm thời đã được gửi.
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Đóng</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="mod-first-name">Họ *</Label>
                <Input
                  id="mod-first-name"
                  placeholder="Nguyễn"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mod-last-name">Tên *</Label>
                <Input
                  id="mod-last-name"
                  placeholder="Văn A"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  maxLength={100}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mod-email">Email *</Label>
              <Input
                id="mod-email"
                type="email"
                placeholder="moderator@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                maxLength={256}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mod-phone">Số điện thoại</Label>
              <Input
                id="mod-phone"
                type="tel"
                placeholder="+84xxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                maxLength={20}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.email || !form.firstName || !form.lastName}
              >
                {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
