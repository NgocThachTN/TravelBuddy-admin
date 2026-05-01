"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { extractApiError } from "@/lib/api-error";
import {
  fetchAdminSystemRules,
  fetchAdminSystemSettings,
  upsertAdminSystemRule,
  upsertAdminSystemSetting,
} from "@/lib/system-rule-api";
import type {
  AdminSystemRule,
  AdminSystemSetting,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ActiveTab = "settings" | "rules";
type ConfigRow = AdminSystemSetting | AdminSystemRule;

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
  tab: ActiveTab;
}

interface FormState {
  key: string;
  value: string;
  valueType: SystemConfigValueType;
  description: string;
  isPublic: boolean;
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
  isPublic: true,
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

function isSetting(row: ConfigRow): row is AdminSystemSetting {
  return "isPublic" in row;
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

function pageLabel(tab: ActiveTab): string {
  return tab === "settings" ? "System Settings" : "System Rules";
}

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [settingsPage, setSettingsPage] = useState(1);
  const [rulesPage, setRulesPage] = useState(1);
  const [settings, setSettings] =
    useState<PagedState<AdminSystemSetting>>(emptyPagedState);
  const [rules, setRules] = useState<PagedState<AdminSystemRule>>(emptyPagedState);
  const [loading, setLoading] = useState<Record<ActiveTab, boolean>>({
    settings: true,
    rules: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const loadSettings = useCallback(async () => {
    setLoading((prev) => ({ ...prev, settings: true }));
    try {
      const response = await fetchAdminSystemSettings({
        search: search || undefined,
        pageNumber: settingsPage,
        pageSize,
      });
      setSettings(toPagedState(response));
    } catch (err) {
      const apiError = extractApiError(err, "Cannot load system settings.");
      setMessage({ kind: "error", text: apiError.message });
    } finally {
      setLoading((prev) => ({ ...prev, settings: false }));
    }
  }, [pageSize, search, settingsPage]);

  const loadRules = useCallback(async () => {
    setLoading((prev) => ({ ...prev, rules: true }));
    try {
      const response = await fetchAdminSystemRules({
        search: search || undefined,
        pageNumber: rulesPage,
        pageSize,
      });
      setRules(toPagedState(response));
    } catch (err) {
      const apiError = extractApiError(err, "Cannot load system rules.");
      setMessage({ kind: "error", text: apiError.message });
    } finally {
      setLoading((prev) => ({ ...prev, rules: false }));
    }
  }, [pageSize, rulesPage, search]);

  const reloadActive = useCallback(async () => {
    if (activeTab === "settings") {
      await loadSettings();
      return;
    }

    await loadRules();
  }, [activeTab, loadRules, loadSettings]);

  useEffect(() => {
    if (activeTab === "settings") {
      void loadSettings();
      return;
    }

    void loadRules();
  }, [activeTab, loadRules, loadSettings]);

  const activeState = activeTab === "settings" ? settings : rules;
  const isLoadingActive = loading[activeTab];

  const activeRows = useMemo<ConfigRow[]>(
    () => (activeTab === "settings" ? settings.items : rules.items),
    [activeTab, rules.items, settings.items],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setSettingsPage(1);
    setRulesPage(1);
  }

  function handlePageSizeChange(value: string) {
    const nextPageSize = Number.parseInt(value, 10);
    setPageSize(Number.isFinite(nextPageSize) ? nextPageSize : DEFAULT_PAGE_SIZE);
    setSettingsPage(1);
    setRulesPage(1);
  }

  function setActivePage(pageNumber: number) {
    const nextPage = Math.max(pageNumber, 1);
    if (activeTab === "settings") {
      setSettingsPage(nextPage);
      return;
    }

    setRulesPage(nextPage);
  }

  function openCreateDialog() {
    setForm(EMPTY_FORM);
    setEditor({ mode: "create", tab: activeTab });
    setMessage(null);
  }

  function openEditDialog(row: ConfigRow) {
    setForm({
      key: row.key,
      value: row.value ?? "",
      valueType: normalizeValueType(row.valueType),
      description: row.description ?? "",
      isPublic: isSetting(row) ? row.isPublic : true,
    });
    setEditor({ mode: "edit", tab: activeTab });
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
      setMessage({ kind: "error", text: "Key is required." });
      return;
    }

    if (!VALUE_TYPES.includes(form.valueType)) {
      setMessage({ kind: "error", text: "Value type is invalid." });
      return;
    }

    if (!editor) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const description = form.description.trim() || null;
      const response =
        editor.tab === "settings"
          ? await upsertAdminSystemSetting({
              key,
              value: form.value,
              valueType: form.valueType,
              description,
              isPublic: form.isPublic,
            })
          : await upsertAdminSystemRule({
              key,
              value: form.value,
              valueType: form.valueType,
              description,
            });

      setEditor(null);
      await reloadActive();
      setMessage({
        kind: response.data.cacheRefreshed ? "success" : "info",
        text: `${pageLabel(editor.tab)} saved. cacheRefreshed = ${String(
          response.data.cacheRefreshed,
        )}.`,
      });
    } catch (err) {
      const apiError = extractApiError(err, "Cannot save system configuration.");
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
            System Configuration
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Manage database-backed settings and rules. Values are shown in plaintext
            and Redis cache is refreshed after each save.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as ActiveTab);
          setMessage(null);
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            <TabsTrigger value="settings">
              <Database className="h-4 w-4" />
              System Settings
            </TabsTrigger>
            <TabsTrigger value="rules">
              <SlidersHorizontal className="h-4 w-4" />
              System Rules
            </TabsTrigger>
          </TabsList>

          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search key, value, description"
                className="pl-9"
              />
            </div>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
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
              Reload
            </Button>
          </form>
        </div>

        <TabsContent value="settings" className="mt-4">
          <ConfigurationTable
            rows={activeRows}
            tab="settings"
            isLoading={loading.settings}
            onEdit={openEditDialog}
          />
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <ConfigurationTable
            rows={activeRows}
            tab="rules"
            isLoading={loading.rules}
            onEdit={openEditDialog}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 border-t pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {activeRows.length} of {activeState.totalCount} rows.
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingActive || activeState.pageNumber <= 1}
            onClick={() => setActivePage(activeState.pageNumber - 1)}
          >
            Previous
          </Button>
          <span className="min-w-28 text-center">
            Page {activeState.pageNumber} / {activeState.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingActive || activeState.pageNumber >= activeState.totalPages}
            onClick={() => setActivePage(activeState.pageNumber + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "edit" ? "Edit" : "Create"} {editor ? pageLabel(editor.tab) : ""}
            </DialogTitle>
            <DialogDescription>
              Save writes the database first, then refreshes the matching Redis cache key.
            </DialogDescription>
          </DialogHeader>

          <form id="system-config-form" className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label htmlFor="config-key">Key</Label>
                <Input
                  id="config-key"
                  value={form.key}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, key: event.target.value }))
                  }
                  disabled={saving || editor?.mode === "edit"}
                  placeholder="example_key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="config-value-type">Value type</Label>
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
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((valueType) => (
                      <SelectItem key={valueType} value={valueType}>
                        {valueType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-value">Value</Label>
              <Textarea
                id="config-value"
                value={form.value}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, value: event.target.value }))
                }
                disabled={saving}
                className="min-h-32 font-mono text-sm"
                placeholder='{"enabled": true}'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-description">Description</Label>
              <Textarea
                id="config-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={saving}
                className="min-h-20"
                placeholder="Optional description"
              />
            </div>

            {editor?.tab === "settings" && (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <Label htmlFor="config-is-public">Public setting</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls the isPublic flag in system_settings.
                  </p>
                </div>
                <Switch
                  id="config-is-public"
                  checked={form.isPublic}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isPublic: checked }))
                  }
                  disabled={saving}
                />
              </div>
            )}
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="system-config-form" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ConfigurationTableProps {
  rows: ConfigRow[];
  tab: ActiveTab;
  isLoading: boolean;
  onEdit: (row: ConfigRow) => void;
}

function ConfigurationTable({
  rows,
  tab,
  isLoading,
  onEdit,
}: ConfigurationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56">Key</TableHead>
            <TableHead className="min-w-64">Value</TableHead>
            <TableHead>Type</TableHead>
            {tab === "settings" && <TableHead>Public</TableHead>}
            <TableHead className="min-w-64">Description</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={tab === "settings" ? 7 : 6} className="h-28 text-center">
                <span className="inline-flex items-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading {pageLabel(tab)}
                </span>
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={tab === "settings" ? 7 : 6} className="h-28 text-center">
                No rows found.
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
                  <Badge variant="outline">{row.valueType}</Badge>
                </TableCell>
                {tab === "settings" && (
                  <TableCell>
                    <Badge variant={isSetting(row) && row.isPublic ? "default" : "secondary"}>
                      {isSetting(row) && row.isPublic ? "true" : "false"}
                    </Badge>
                  </TableCell>
                )}
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
                    aria-label={`Edit ${row.key}`}
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
