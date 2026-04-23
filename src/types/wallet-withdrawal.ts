export type AdminWalletWithdrawalStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Rejected"
  | "Cancelled"
  | string;

export type AdminWalletWithdrawalStatusFilter = "all" | "pending" | "processing";

export interface AdminWalletWithdrawalRecord {
  withdrawalId: string;
  userId: string;
  walletId: string;
  bankAccountId: string;
  amount: number;
  feeAmount: number;
  feeRatePercent: number;
  netAmount: number;
  currency: string;
  status: AdminWalletWithdrawalStatus;
  note?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  bankCode?: string | null;
  bankAccountNumber?: string | null;
  maskedBankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  rejectedReason?: string | null;
  externalTransactionRef?: string | null;
  processedByAdminId?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface WalletWithdrawalSettings {
  withdrawFeePercent: number;
  minimumWithdrawAmount: number;
}

export interface GetAdminWalletWithdrawalsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: AdminWalletWithdrawalStatusFilter;
}

export interface MarkWalletWithdrawalProcessingPayload {
  note?: string;
}

export interface ApproveWalletWithdrawalPayload {
  externalTransactionRef: string;
}

export interface RejectWalletWithdrawalPayload {
  rejectedReason: string;
}

export interface UpdateWalletWithdrawalSettingsPayload {
  withdrawFeePercent: number;
  minimumWithdrawAmount: number;
}
