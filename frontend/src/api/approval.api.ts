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
  status: 'pending' | 'approved' | 'rejected';
};

export type CompleteBarangMasukPayload = {
  approval_id: number;
  kode_barang: string;
  lokasi_simpan: string;
  qty: number;
  satuan: string;
  tanggal: string;
};

export const fetchApproval = () => http.get<ApprovalItem[]>('/approval');
export const approveRequest = (id: number) => http.post<ApprovalItem>(`/approval/${id}/approve`);
export const rejectRequest = (id: number) => http.post<ApprovalItem>(`/approval/${id}/reject`);
export const completeBarangMasuk = (payload: CompleteBarangMasukPayload) => 
  http.post(`/approval/complete-barang-masuk`, payload);
