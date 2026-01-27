import { http } from './http';

export type UnitItem = {
  id: number;
  name: string;
  username: string;
};

export type CreateUnitPayload = {
  unitName: string;
  username: string;
  password: string;
};

export const fetchUnits = () => http.get<UnitItem[]>('/units');
export const createUnit = (payload: CreateUnitPayload) => http.post<UnitItem>('/units', payload);
