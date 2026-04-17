export interface SubscriptionPackage {
  subscriptionPackageId: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  isEnabled: boolean;
  isDefaultFree: boolean;
  tripCreateLimit: number;
  tripParticipantLimit: number;
  aiUsageLimit: number;
  memoryPhotoUploadLimit: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPackagesResponse {
  data: SubscriptionPackage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateSubscriptionPackagePayload {
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  isEnabled: boolean;
  isDefaultFree: boolean;
  tripCreateLimit: number;
  tripParticipantLimit: number;
  aiUsageLimit: number;
  memoryPhotoUploadLimit: number;
}

export type UpdateSubscriptionPackagePayload = Partial<CreateSubscriptionPackagePayload>;
