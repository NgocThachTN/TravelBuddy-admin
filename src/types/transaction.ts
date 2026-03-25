export type AdminTransactionRecord = Record<string, unknown>;

export interface GetAdminTransactionsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  packageName?: string;
}
