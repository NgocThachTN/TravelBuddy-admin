import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bike,
  Building2,
  CarFront,
  Coffee,
  Cross,
  Droplets,
  Flag,
  Hotel,
  Landmark,
  LocateFixed,
  MapPin,
  ParkingCircle,
  Play,
  ShieldAlert,
  ShieldCheck,
  Syringe,
  Utensils,
  Waves,
  Wrench,
} from "lucide-react";
import type { CheckpointTypeCode } from "@/types";

export interface CheckpointMeta {
  label: string;
  color: string;
  icon: LucideIcon;
  sortOrder: number;
  markerGlyph: string;
}

const CHECKPOINT_META: Record<CheckpointTypeCode, CheckpointMeta> = {
  Start: { label: "Bắt đầu", color: "#00C853", icon: Play, sortOrder: 0, markerGlyph: "▶" },
  Stop: { label: "Điểm dừng", color: "#9BADBD", icon: MapPin, sortOrder: 1, markerGlyph: "•" },
  Destination: { label: "Điểm đến", color: "#F59E0B", icon: Flag, sortOrder: 2, markerGlyph: "⚑" },
  Return: { label: "Quay về", color: "#2874CC", icon: LocateFixed, sortOrder: 3, markerGlyph: "↩" },
  End: { label: "Kết thúc", color: "#AB47BC", icon: ShieldCheck, sortOrder: 4, markerGlyph: "✓" },
  Waypoint: { label: "Điểm trung gian", color: "#64748B", icon: MapPin, sortOrder: 5, markerGlyph: "•" },
  Rest: { label: "Nghỉ ngơi", color: "#0EA5E9", icon: Waves, sortOrder: 6, markerGlyph: "R" },
  Food: { label: "Ăn uống", color: "#F97316", icon: Utensils, sortOrder: 7, markerGlyph: "F" },
  Cafe: { label: "Cà phê", color: "#8B5E3C", icon: Coffee, sortOrder: 8, markerGlyph: "C" },
  Fuel: { label: "Đổ xăng", color: "#14B8A6", icon: CarFront, sortOrder: 9, markerGlyph: "⛽" },
  Repair: { label: "Sửa xe", color: "#64748B", icon: Wrench, sortOrder: 10, markerGlyph: "🛠" },
  Parking: { label: "Bãi đỗ", color: "#64748B", icon: ParkingCircle, sortOrder: 11, markerGlyph: "P" },
  Hotel: { label: "Khách sạn", color: "#2563EB", icon: Hotel, sortOrder: 12, markerGlyph: "H" },
  Camping: { label: "Cắm trại", color: "#15803D", icon: Landmark, sortOrder: 13, markerGlyph: "⛺" },
  Toilet: { label: "Nhà vệ sinh", color: "#0EA5E9", icon: Droplets, sortOrder: 14, markerGlyph: "WC" },
  Viewpoint: { label: "Điểm ngắm cảnh", color: "#6366F1", icon: Landmark, sortOrder: 15, markerGlyph: "V" },
  Attraction: { label: "Điểm tham quan", color: "#EC4899", icon: Building2, sortOrder: 16, markerGlyph: "A" },
  Water: { label: "Nước", color: "#0284C7", icon: Droplets, sortOrder: 17, markerGlyph: "W" },
  Emergency: { label: "Khẩn cấp", color: "#DC2626", icon: AlertTriangle, sortOrder: 18, markerGlyph: "!" },
  Hospital: { label: "Bệnh viện", color: "#DC2626", icon: Cross, sortOrder: 19, markerGlyph: "+" },
  Police: { label: "Cảnh sát", color: "#1D4ED8", icon: ShieldCheck, sortOrder: 20, markerGlyph: "👮" },
  Hazard: { label: "Nguy hiểm", color: "#B91C1C", icon: ShieldAlert, sortOrder: 21, markerGlyph: "⚠" },
  Checkpoint: { label: "Trạm kiểm soát", color: "#7C3AED", icon: ShieldCheck, sortOrder: 22, markerGlyph: "CP" },
  Ferry: { label: "Phà", color: "#0F766E", icon: Bike, sortOrder: 23, markerGlyph: "⛴" },
  Other: { label: "Khác", color: "#6B7280", icon: Syringe, sortOrder: 24, markerGlyph: "…" },
};

const FALLBACK_META: CheckpointMeta = {
  label: "Khác",
  color: "#6B7280",
  icon: MapPin,
  sortOrder: 999,
  markerGlyph: "•",
};

export function checkpointMetaByType(type: CheckpointTypeCode | string | null | undefined): CheckpointMeta {
  if (!type) return FALLBACK_META;
  return CHECKPOINT_META[type as CheckpointTypeCode] ?? FALLBACK_META;
}

export function checkpointLabelVi(type: CheckpointTypeCode | string | null | undefined): string {
  return checkpointMetaByType(type).label;
}

