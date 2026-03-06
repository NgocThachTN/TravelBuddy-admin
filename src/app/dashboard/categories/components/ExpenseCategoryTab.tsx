"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchExpenseCategories,
  createExpenseCategories,
} from "@/lib/api";
import type { ExpenseCategoryDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, RefreshCw, Loader2, Receipt } from "lucide-react";
import PaginationControl from "@/components/pagination-control";

export default function ExpenseCategoryTab() {
  const [categories, setCategories] = useState<ExpenseCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchExpenseCategories();
      const raw = res.data;
      setCategories(Array.isArray(raw) ? raw : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setFormName("");
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) {
      setFormError("Tên danh mục không được để trống");
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      await createExpenseCategories({
        items: [{ expenseCategoryName: formName.trim() }],
      });
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
              <Skeleton className="h-4 w-40" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-24" />
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
            <Receipt className="h-7 w-7 text-destructive" />
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
          <span className="text-xs text-muted-foreground">{categories.length} danh mục chi phí</span>
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
              <TableHead className="pl-5">Tên danh mục</TableHead>
              <TableHead className="w-[300px]">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">Chưa có danh mục chi phí nào</p>
                </TableCell>
              </TableRow>
            ) : (
              categories
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((cat) => (
                  <TableRow key={cat.expenseCategoryId}>
                    <TableCell className="pl-5 font-medium text-sm">
                      {cat.expenseCategoryName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {cat.expenseCategoryId}
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

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm danh mục chi phí</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">
                Tên danh mục <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Ăn uống, Di chuyển, Lưu trú..."
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
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
