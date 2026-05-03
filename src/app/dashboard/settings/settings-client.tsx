"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
} from "lucide-react";
import { extractApiError } from "@/lib/api-error";
import {
  fetchAdminSystemRules,
  upsertAdminSystemRule,
} from "@/lib/system-rule-api";
import type {
  AdminSystemRule,
  BePagedWrapper,
  SystemConfigValueType,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type ConfigRow = AdminSystemRule;

type Message = {
  kind: "success" | "error" | "info";
  text: string;
};

interface PagedState<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface EditorState {
  mode: "create" | "edit";
}

interface FormState {
  key: string;
  value: string;
  valueType: SystemConfigValueType;
  description: string;
}

const VALUE_TYPES: SystemConfigValueType[] = [
  "string",
  "int",
  "long",
  "decimal",
  "bool",
  "json",
];

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_FORM: FormState = {
  key: "",
  value: "",
  valueType: "string",
  description: "",
};

const VALUE_TYPE_LABELS: Record<SystemConfigValueType, string> = {
  string: "Chuỗi",
  int: "Số nguyên",
  long: "Số nguyên dài",
  decimal: "Số thập phân",
  bool: "Đúng hoặc sai",
  json: "Dữ liệu cấu trúc",
};

function emptyPagedState<T>(): PagedState<T> {
  return {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  };
}

function toPagedState<T>(response: BePagedWrapper<T>): PagedState<T> {
  return {
    items: response.data.items,
    totalCount: response.data.totalCount,
    pageNumber: response.data.pageNumber,
    pageSize: response.data.pageSize,
    totalPages: Math.max(response.data.totalPages || 1, 1),
  };
}

function normalizeValueType(valueType: string | null | undefined): SystemConfigValueType {
  return VALUE_TYPES.includes(valueType as SystemConfigValueType)
    ? (valueType as SystemConfigValueType)
    : "string";
}

function formatValueType(valueType: string | null | undefined): string {
  return VALUE_TYPE_LABELS[normalizeValueType(valueType)];
}

function getDescription(row: ConfigRow): string {
  return row.description?.trim() ? row.description : "-";
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function pageLabel(): string {
  return "quy tắc hệ thống";
}

export default function SettingsClient() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [rulesPage, setRulesPage] = useState(1);
  const [rules, setRules] = useState<PagedState<AdminSystemRule>>(emptyPagedState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAdminSystemRules({
        search: search || undefined,
        pageNumber: rulesPage,
        pageSize,
      });
      setRules(toPagedState(response));
    } catch (err) {
      const apiError = extractApiError(err, "Không tải được quy tắc hệ thống.");
      setMessage({ kind: "error", text: apiError.message });
    } finally {
      setLoading(false);
    }
  }, [pageSize, rulesPage, search]);

  const reloadActive = useCallback(async () => {
    await loadRules();
  }, [loadRules]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const activeState = rules;
  const isLoadingActive = loading;

  const activeRows = useMemo<ConfigRow[]>(
    () => rules.items,
    [rules.items],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setRulesPage(1);
  }

  function handlePageSizeChange(value: string) {
    const nextPageSize = Number.parseInt(value, 10);
    setPageSize(Number.isFinite(nextPageSize) ? nextPageSize : DEFAULT_PAGE_SIZE);
    setRulesPage(1);
  }

  function setActivePage(pageNumber: number) {
    const nextPage = Math.max(pageNumber, 1);
    setRulesPage(nextPage);
  }

  function openCreateDialog() {
    setForm(EMPTY_FORM);
    setEditor({ mode: "create" });
    setMessage(null);
  }

  function openEditDialog(row: ConfigRow) {
    setForm({
      key: row.key,
      value: row.value ?? "",
      valueType: normalizeValueType(row.valueType),
      description: row.description ?? "",
    });
    setEditor({ mode: "edit" });
    setMessage(null);
  }

  function closeDialog() {
    if (!saving) {
      setEditor(null);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const key = form.key.trim();
    if (!key) {
      setMessage({ kind: "error", text: "Vui lòng nhập mã quy tắc." });
      return;
    }

    if (!VALUE_TYPES.includes(form.valueType)) {
      setMessage({ kind: "error", text: "Kiểu dữ liệu không hợp lệ." });
      return;
    }

    if (!editor) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const description = form.description.trim() || null;
      const response = await upsertAdminSystemRule({
        key,
        value: form.value,
        valueType: form.valueType,
        description,
      });

      setEditor(null);
      await reloadActive();
      setMessage({
        kind: response.data.cacheRefreshed ? "success" : "info",
        text: response.data.cacheRefreshed
          ? "Đã lưu quy tắc và làm mới bộ nhớ đệm."
          : "Đã lưu quy tắc. Bộ nhớ đệm chưa được làm mới.",
      });
    } catch (err) {
      const apiError = extractApiError(err, "Không lưu được quy tắc hệ thống.");
      setMessage({ kind: "error", text: apiError.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Settings2 className="h-6 w-6" />
            Cài đặt hệ thống
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cập nhật các quy tắc vận hành. Sau khi lưu, hệ thống sẽ làm mới bộ nhớ
            đệm liên quan.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm quy tắc
        </Button>
      </div>

      {message && (
        <div
          className={
            message.kind === "error"
              ? "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : message.kind === "success"
                ? "rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                : "rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
          }
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo mã, giá trị hoặc mô tả"
                className="pl-9"
              />
            </div>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue placeholder="Số dòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 dòng</SelectItem>
                <SelectItem value="25">25 dòng</SelectItem>
                <SelectItem value="50">50 dòng</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void reloadActive()}
              disabled={isLoadingActive}
            >
              {isLoadingActive ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Làm mới
            </Button>
          </form>
        </div>

        <ConfigurationTable
          rows={activeRows}
          isLoading={loading}
          onEdit={openEditDialog}
        />
      </div>

      <div className="flex flex-col gap-2 border-t pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Đang hiển thị {activeRows.length} trong {activeState.totalCount} dòng.
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingActive || activeState.pageNumber <= 1}
            onClick={() => setActivePage(activeState.pageNumber - 1)}
          >
            Trước
          </Button>
          <span className="min-w-28 text-center">
            Trang {activeState.pageNumber} / {activeState.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingActive || activeState.pageNumber >= activeState.totalPages}
            onClick={() => setActivePage(activeState.pageNumber + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "edit" ? "Chỉnh sửa" : "Thêm"} quy tắc hệ thống
            </DialogTitle>
            <DialogDescription>
              Sau khi lưu, hệ thống cập nhật cơ sở dữ liệu và làm mới bộ nhớ đệm
              tương ứng.
            </DialogDescription>
          </DialogHeader>

          <form id="system-config-form" className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label htmlFor="config-key">Mã quy tắc</Label>
                <Input
                  id="config-key"
                  value={form.key}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, key: event.target.value }))
                  }
                  disabled={saving || editor?.mode === "edit"}
                  placeholder="ma_quy_tac"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="config-value-type">Kiểu dữ liệu</Label>
                <Select
                  value={form.valueType}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      valueType: value as SystemConfigValueType,
                    }))
                  }
                  disabled={saving}
                >
                  <SelectTrigger id="config-value-type" className="w-full">
                    <SelectValue placeholder="Chọn kiểu" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((valueType) => (
                      <SelectItem key={valueType} value={valueType}>
                        {VALUE_TYPE_LABELS[valueType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-value">Giá trị</Label>
              <Textarea
                id="config-value"
                value={form.value}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, value: event.target.value }))
                }
                disabled={saving}
                className="min-h-32 font-mono text-sm"
                placeholder="Nhập giá trị áp dụng cho quy tắc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-description">Mô tả</Label>
              <Textarea
                id="config-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={saving}
                className="min-h-20"
                placeholder="Ghi chú ngắn để người quản trị dễ hiểu"
              />
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" form="system-config-form" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ConfigurationTableProps {
  rows: ConfigRow[];
  isLoading: boolean;
  onEdit: (row: ConfigRow) => void;
}

function ConfigurationTable({
  rows,
  isLoading,
  onEdit,
}: ConfigurationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56">Mã</TableHead>
            <TableHead className="min-w-64">Giá trị</TableHead>
            <TableHead>Kiểu dữ liệu</TableHead>
            <TableHead className="min-w-64">Mô tả</TableHead>
            <TableHead>Cập nhật lúc</TableHead>
            <TableHead className="w-24 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-28 text-center">
                <span className="inline-flex items-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải {pageLabel()}
                </span>
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-28 text-center">
                Chưa có dữ liệu phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-mono text-xs">{row.key}</TableCell>
                <TableCell className="whitespace-normal">
                  <code className="block max-w-xl whitespace-pre-wrap break-all rounded bg-muted px-2 py-1 text-xs">
                    {row.value}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{formatValueType(row.valueType)}</Badge>
                </TableCell>
                <TableCell className="max-w-sm whitespace-normal text-muted-foreground">
                  {getDescription(row)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(row.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row)}
                    aria-label={`Chỉnh sửa ${row.key}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
