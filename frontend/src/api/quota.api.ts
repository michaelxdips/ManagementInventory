import { http } from './http';

export type QuotaItem = {
    id: number;
    item_id: number;
    item_name: string;
    item_code: string;
    unit_id: number;
    unit_name: string;
    quota_max: number;
    quota_used: number;
    quota_remaining: number;
};

export type QuotaItemOption = {
    id: number;
    name: string;
    code: string;
};

export type QuotaUnitOption = {
    id: number;
    name: string;
};

export type CreateQuotaPayload = {
    item_id: number;
    unit_id: number;
    quota_max: number;
};

export const fetchQuotas = () => http.get<QuotaItem[]>('/quota');
export const fetchQuotaItems = () => http.get<QuotaItemOption[]>('/quota/items');
export const fetchQuotaUnits = () => http.get<QuotaUnitOption[]>('/quota/units');
export const createQuota = (payload: CreateQuotaPayload) => http.post<QuotaItem>('/quota', payload);
export const deleteQuota = (id: number) => http.delete<void>(`/quota/${id}`);
