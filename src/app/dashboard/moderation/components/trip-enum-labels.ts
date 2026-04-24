import type { MemberLevelCatalogLevel } from "@/types";

const TRIP_TYPE_LABELS_VI: Record<string, string> = {
  Adventure: "Phiêu lưu",
  Relaxation: "Nghỉ dưỡng",
  Cultural: "Văn hóa",
  Touring: "Tham quan",
  Trekking: "Leo núi",
  Camping: "Cắm trại",
  Beach: "Biển",
  Ecotourism: "Sinh thái",
  FoodTour: "Ẩm thực",
  ExtremeSport: "Thể thao mạo hiểm",
  Spiritual: "Tâm linh",
  Volunteer: "Tình nguyện",
  Photography: "Nhiếp ảnh",
  MotorbikeTour: "Phượt xe máy",
  NightTour: "Tour đêm",
  Teambuilding: "Team building",
  CityExploration: "Khám phá thành phố",
  SoloTravel: "Du lịch một mình",
  RoadTrip: "Đi đường dài",
  Backpacking: "Du lịch bụi",
  CloudHunting: "Săn mây",
  MountainPassChallenge: "Chinh phục đèo",
  IslandHopping: "Đi nhiều đảo",
  WeekendTrip: "Đi cuối tuần",
  HomestayExperience: "Trải nghiệm homestay",
  BorderlandExploration: "Khám phá biên giới",
  SeasonalFlowerTrip: "Mùa hoa",
  Other: "Khác",
};

const VEHICLE_TYPE_LABELS_VI: Record<string, string> = {
  Motorbike: "Xe máy",
  Car: "Ô tô",
  Suv: "SUV",
  Bus: "Xe khách",
  Bicycle: "Xe đạp",
  ElectricBike: "Xe đạp điện",
  Jeep: "Jeep",
  PickupTruck: "Xe bán tải",
  Limousine: "Limousine",
  TukTuk: "Tuk Tuk",
  Boat: "Thuyền",
  Walking: "Đi bộ",
  Scooter: "Xe tay ga",
  UnderboneMotorbike: "Xe côn tay",
  OffroadMotorbike: "Xe cào cào",
  Other: "Khác",
};

const EXPENSE_TYPE_LABELS_VI: Record<string, string> = {
  Fuel: "Xăng xe",
  Food: "Ăn uống",
  Accommodation: "Lưu trú",
  Ticket: "Vé",
  Equipment: "Trang bị",
  Toll: "Phí cầu đường",
  Parking: "Phí gửi xe",
  Insurance: "Bảo hiểm",
  Emergency: "Khẩn cấp",
  Shopping: "Mua sắm",
  Transportation: "Vận chuyển",
  Activity: "Hoạt động",
  GuideService: "Hướng dẫn viên",
  Communication: "Liên lạc",
  Healthcare: "Y tế",
  TaxFee: "Thuế phí",
  MotorbikeRental: "Thuê xe máy",
  MotorbikeMaintenance: "Bảo dưỡng xe máy",
  FerryBoatFee: "Phí phà/thuyền",
  CoffeeBreak: "Nghỉ cà phê",
  LocalSpecialty: "Đặc sản địa phương",
  HomestayFee: "Phí homestay",
  CampingFee: "Phí cắm trại",
  BorderPermitFee: "Phí giấy phép biên giới",
  Other: "Chi phí khác",
};

const MEMBER_LEVEL_LABELS_VI: Record<string, string> = {
  "0": "Người mới",
  Newbie: "Người mới",
  "1": "Nghiệp dư",
  Fresher: "Nghiệp dư",
  "2": "Quen đường",
  Junior: "Quen đường",
  "3": "Thành thạo",
  Regular: "Thành thạo",
  "4": "Chuyên nghiệp",
  Experienced: "Chuyên nghiệp",
  "5": "Lão làng",
  Veteran: "Lão làng",
  "6": "Kỳ cựu",
  Hardcore: "Kỳ cựu",
};

const TRAVEL_MODE_LABELS_VI: Record<string, string> = {
  driving: "Lái xe",
  cycling: "Đạp xe",
  walking: "Đi bộ",
  motorbike: "Xe máy",
  car: "Ô tô",
};

function normalize(value: string) {
  return value.trim();
}

function mapEnumLabel(value: string | null | undefined, labels: Record<string, string>) {
  if (!value) return "Không rõ";
  const raw = normalize(value);
  if (labels[raw]) return labels[raw];
  const directLowerKey = Object.keys(labels).find((key) => key.toLowerCase() === raw.toLowerCase());
  if (directLowerKey) return labels[directLowerKey];
  return raw;
}

export function tripTypeLabelVi(value: string | null | undefined) {
  return mapEnumLabel(value, TRIP_TYPE_LABELS_VI);
}

export function vehicleTypeLabelVi(value: string | null | undefined) {
  return mapEnumLabel(value, VEHICLE_TYPE_LABELS_VI);
}

export function expenseTypeLabelVi(value: string | null | undefined) {
  return mapEnumLabel(value, EXPENSE_TYPE_LABELS_VI);
}

export function memberLevelLabelVi(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "Không rõ";
  return mapEnumLabel(String(value), MEMBER_LEVEL_LABELS_VI);
}

export function travelModeLabelVi(value: string | null | undefined) {
  return mapEnumLabel(value, TRAVEL_MODE_LABELS_VI);
}

export function memberLevelLabelViWithCatalog(
  value: number | string | null | undefined,
  levels?: MemberLevelCatalogLevel[] | null,
) {
  if (value === null || value === undefined) return "Không rõ";

  const raw = String(value).trim();
  if (raw && levels?.length) {
    const lower = raw.toLowerCase();
    const matchedLevel = levels.find((level) => (
      String(level.code) === raw ||
      level.apiName.toLowerCase() === lower ||
      level.displayNameVi.toLowerCase() === lower
    ));

    if (matchedLevel) {
      return matchedLevel.displayNameVi;
    }
  }

  return memberLevelLabelVi(value);
}

