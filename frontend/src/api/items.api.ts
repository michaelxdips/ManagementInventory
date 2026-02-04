import { http } from './http';

export type Item = {
  id: number;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  location: string;
};

export type UpdateItemPayload = {
  nama_barang: string;
  kode_barang: string;
  qty: number;
  satuan: string;
  lokasi_simpan: string;
};

// Backend returns fields using old naming; map to UI shape
export const fetchItems = () =>
  http.get<any[]>('/atk-items').then((rows) =>
    rows.map((r) => ({
      id: r.id,
      name: r.nama_barang ?? r.nama ?? r.name,
      code: r.kode_barang ?? r.code,
      quantity: r.qty ?? r.stok ?? r.quantity,
      unit: r.satuan ?? r.unit,
      location: r.lokasi_simpan ?? r.location ?? '-',
    }))
  );

export const getItemById = (id: number) =>
  http.get<any>(`/atk-items/${id}`).then((r) => ({
    id: r.id,
    name: r.nama_barang ?? r.nama ?? r.name,
    code: r.kode_barang ?? r.code,
    quantity: r.qty ?? r.stok ?? r.quantity,
    unit: r.satuan ?? r.unit,
    location: r.lokasi_simpan ?? r.location ?? '-',
  }));

export const updateItem = (id: number, payload: UpdateItemPayload) =>
  http.put(`/atk-items/${id}`, payload);
