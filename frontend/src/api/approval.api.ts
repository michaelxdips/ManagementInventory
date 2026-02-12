import { http } from './http';

export type ApprovalItem = {
  id: number;
  date: string;
  name: string;
  code: string;
  qty: number;
  unit: string;
  receiver: string;
  dept: string;
  status: 'pending' | 'approval_review' | 'approved' | 'rejected';
};

export type ApproveResponse = ApprovalItem & {
  message?: string;
};

export type ApprovalDetail = {
  id: number;
  date: string;
  name: string;
  requestQty: number;
  unit: string;
  receiver: string;
  dept: string;
  status: string;
  kode_barang: string;
  lokasi_barang: string;
  stok_tersedia: number;
  satuan: string;
  // Quota fields
  quota_max: number | null;
  quota_used: number;
  quota_remaining: number | null;
  fair_share: number | null;
};

export type ReviewResponse = {
  id: number;
  status: string;
  message: string;
};

export type FinalizeResponse = {
  message: string;
  finalQty: number;
  newStock: number;
};

export const fetchApproval = () => http.get<ApprovalItem[]>('/approval');
export const approveRequest = (id: number) => http.post<ApproveResponse>(`/approval/${id}/approve`);
export const rejectRequest = (id: number) => http.post<ApprovalItem>(`/approval/${id}/reject`);

// Step 2: Review & Finalize
export const reviewRequest = (id: number) => http.post<ReviewResponse>(`/approval/${id}/review`);
export const fetchApprovalDetail = (id: number) => http.get<ApprovalDetail>(`/approval/${id}/detail`);
export const finalizeRequest = (id: number, finalQty: number) =>
  http.post<FinalizeResponse>(`/approval/${id}/finalize`, { finalQty });
