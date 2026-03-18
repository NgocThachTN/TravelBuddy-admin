// Partner Registration Request DTOs
export interface PartnerRequestListItem {
  partnerRegistrationRequestId: string;
  requestCode: string;
  registrationStatus: string;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  companyName?: string;
  servicePartnerName?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PartnerRequestDetail {
  partnerRegistrationRequestId: string;
  requestCode: string;
  registrationStatus: string;
  registrationReason?: string;
  reviewedAt?: string;
  partnerId?: string;
  servicePartnerId?: string;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  companyName?: string;
  servicePartnerName?: string;
  servicePartnerDescription?: string;
  servicePartnerStatus?: string;
  addressId?: string;
  wardCode?: number;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  addressLat?: number;
  addressLng?: number;
  contactName?: string;
  contactPhone?: string;
  licenseFileUrl?: string;
}

export interface GetPartnerRequestsParams {
  pageNumber?: number;
  pageSize?: number;
  registrationStatus?: string;
}

export interface ReviewPartnerRequestPayload {
  reviewNote?: string;
}

// Service Partner DTOs
export interface ServicePartnerListItem {
  servicePartnerId: string;
  servicePartnerName?: string;
  servicePartnerDescription?: string;
  servicePartnerStatus?: string;
  isLocked?: boolean;
  partnerId: string;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  companyName?: string;
  taxId?: string;
  vehicleServiceScope?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface ServicePartnerDetail {
  servicePartnerId: string;
  servicePartnerName?: string;
  servicePartnerDescription?: string;
  servicePartnerStatus?: string;
  isLocked?: boolean;
  createdAt: string;
  updatedAt?: string;
  partnerId: string;
  userId?: string;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  companyName?: string;
  taxId?: string;
  vehicleServiceScope?: string;
  identifyCardUrl?: string;
  businessLicenseUrl?: string;
  profileStatus?: string;
  verificationStatus?: string;
  verifiedAt?: string;
  verificationSummary?: string;
  addressId?: string;
  wardCode?: number;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  contactName?: string;
  contactPhone?: string;
  addressLat?: number;
  addressLng?: number;
}

export interface GetServicePartnersParams {
  pageNumber?: number;
  pageSize?: number;
  servicePartnerStatus?: string;
}

// Service Partner Fee DTOs
export interface ServicePartnerFee {
  id: string;
  name: string;
  description?: string;
  feeType: string;
  feeAmount: number;
  feePercentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServicePartnerFeePayload {
  name: string;
  description?: string;
  feeType: string;
  feeAmount?: number;
  feePercentage?: number;
  isActive: boolean;
}

export interface UpdateServicePartnerFeePayload {
  name?: string;
  description?: string;
  feeType?: string;
  feeAmount?: number;
  feePercentage?: number;
  isActive?: boolean;
}

export interface GetServicePartnerFeesParams {
  pageNumber?: number;
  pageSize?: number;
}
