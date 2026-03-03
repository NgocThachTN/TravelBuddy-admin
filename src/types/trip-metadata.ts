// ── Enums ─────────────────────────────────────────────────────────────

export const TRIP_TYPE_CATEGORY_CODES = [
  "Adventure", "Relaxation", "Cultural", "Touring", "Trekking",
  "Camping", "Beach", "Ecotourism", "FoodTour", "ExtremeSport",
  "Spiritual", "Volunteer", "Photography", "MotorbikeTour",
  "NightTour", "Teambuilding", "CityExploration", "Other",
] as const;
export type TripTypeCategoryTypeCode = (typeof TRIP_TYPE_CATEGORY_CODES)[number];

export const VEHICLE_CATEGORY_CODES = [
  "Motorbike", "Car", "Suv", "Bus", "Bicycle", "ElectricBike",
  "Jeep", "PickupTruck", "Limousine", "TukTuk", "Boat", "Walking", "Other",
] as const;
export type VehicleCategoryTypeCode = (typeof VEHICLE_CATEGORY_CODES)[number];

// ── Response DTOs ─────────────────────────────────────────────────────

export interface TripTypeCategoryDto {
  tripTypeCategoryId: number;
  name: string | null;
  type: string | null;
  iconUrl: string | null;
}

export interface VehicleCategoryDto {
  vehicleCategoryId: number;
  name: string | null;
  type: string | null;
  iconUrl: string | null;
}

export interface ExpenseCategoryDto {
  expenseCategoryId: string;
  expenseCategoryName: string | null;
}

// ── Request DTOs ──────────────────────────────────────────────────────

export interface CreateTripTypeCategoryItem {
  name: string;
  type: TripTypeCategoryTypeCode;
  iconUrl?: string;
}

export interface CreateTripTypeCategoryBatchPayload {
  items: CreateTripTypeCategoryItem[];
}

export interface UpdateTripTypeCategoryPayload {
  name?: string;
  type?: TripTypeCategoryTypeCode;
  iconUrl?: string;
}

export interface CreateVehicleCategoryItem {
  name: string;
  type: VehicleCategoryTypeCode;
  iconUrl?: string;
}

export interface CreateVehicleCategoryBatchPayload {
  items: CreateVehicleCategoryItem[];
}

export interface UpdateVehicleCategoryPayload {
  name?: string;
  type?: VehicleCategoryTypeCode;
  iconUrl?: string;
}

export interface CreateExpenseCategoryItem {
  expenseCategoryName: string;
}

export interface CreateExpenseCategoryBatchPayload {
  items: CreateExpenseCategoryItem[];
}
