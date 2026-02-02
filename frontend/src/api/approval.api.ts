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

export type ApproveResponse = ApprovalItem & {
  message?: string;
};

export const fetchApproval = () => http.get<ApprovalItem[]>('/approval');
export const approveRequest = (id: number) => http.post<ApproveResponse>(`/approval/${id}/approve`);
export const rejectRequest = (id: number) => http.post<ApprovalItem>(`/approval/${id}/reject`);
