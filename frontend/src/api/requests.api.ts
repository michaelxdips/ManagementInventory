import { http } from './http';

export type RequestItem = {
  id: number;
  date: string;
  item: string;
  qty: number;
  unit: string;
  receiver: string;
  dept: string;
  status: 'PENDING' | 'REJECTED' | 'FINISHED';
};

export type CreateRequestPayload = {
  date: string;
  item: string;
  qty: number;
  unit: string;
  receiver: string;
  dept: string;
};

export const fetchRequests = () => http.get<RequestItem[]>('/requests');

export const createRequest = (payload: CreateRequestPayload) => http.post<RequestItem>('/requests', payload);
