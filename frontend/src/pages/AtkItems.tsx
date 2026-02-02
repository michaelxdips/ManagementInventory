import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchItems, Item, updateItem, takeItem } from '../api/items.api';
import useAuth from '../hooks/useAuth';

const fallbackItems: Item[] = [
	{ id: 1, name: '3M Double Tape Abu-Abu', code: '3M-DTP-GRY', quantity: 0, unit: 'pcs', location: 'Lemari' },
	{ id: 2, name: 'Amplop Coklat 110x240', code: 'APP-BRW-110', quantity: 2, unit: 'pack', location: 'Lemari' },
	{ id: 3, name: 'Amplop Coklat 140x270', code: 'APP-BRW-140', quantity: 1001, unit: 'pack', location: 'Lemari' },
	{ id: 4, name: 'Amplop Polos Coklat', code: 'APP-PLS-BRW', quantity: 190, unit: 'pcs', location: 'Lemari' },
	{ id: 5, name: 'Amplop Telkom Polos', code: 'APP-TLM-CLS', quantity: 20, unit: 'bungkus', location: 'Lemari' },
	{ id: 6, name: 'Amplop Telkom Jendela', code: 'APP-TLM-JDL', quantity: 11, unit: 'bundle', location: 'Lemari' },
	{ id: 7, name: 'Bola Golf', code: 'BAL-GLF', quantity: 3, unit: 'kotak', location: 'Lemari' },
	{ id: 8, name: 'Ball Liner Biru', code: 'BAL-LNR-BLU', quantity: 109, unit: 'pcs', location: 'Lemari' },
	{ id: 9, name: 'Ball Liner Hijau', code: 'BAL-LNR-HJU', quantity: 2, unit: 'pcs', location: 'Lemari' },
	{ id: 10, name: 'Ball Liner Hitam', code: 'BAL-LNR-HTM', quantity: 19, unit: 'pcs', location: 'Lemari' },
];

interface EditFormData {
	name: string;
	code: string;
	quantity: number;
	unit: string;
	location: string;
}

const AtkItems = () => {
	const { hasRole } = useAuth();
	const canOperateStock = hasRole(['admin', 'superadmin']);
	const [draftSearch, setDraftSearch] = useState('');
	const [draftSort, setDraftSort] = useState<'asc' | 'desc'>('asc');
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOption, setSortOption] = useState<'asc' | 'desc'>('asc');
	const [page, setPage] = useState(1);
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingItem, setEditingItem] = useState<Item | null>(null);
	const [editFormData, setEditFormData] = useState<EditFormData>({ name: '', code: '', quantity: 0, unit: '', location: '' });
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState<string | null>(null);
	const [showTakeModal, setShowTakeModal] = useState(false);
	const [takeItem_selected, setTakeItem_selected] = useState<Item | null>(null);
	const [takeQty, setTakeQty] = useState(1);
	const [takeDate, setTakeDate] = useState('');
	const [takePenerima, setTakePenerima] = useState('');
	const [takeLoading, setTakeLoading] = useState(false);
	const [takeError, setTakeError] = useState<string | null>(null);
	const [takeMessage, setTakeMessage] = useState<string | null>(null);

	const perPage = 10;

	useEffect(() => {
		setPage(1);
	}, [searchTerm, sortOption]);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		fetchItems()
			.then((rows) => {
				if (!mounted) return;
				setItems(rows);
				setError(null);
			})
			.catch(() => {
				if (!mounted) return;
				setItems(fallbackItems);
				setError('Gagal memuat data ATK dari server, menampilkan data mock');
			})
			.finally(() => {
				if (!mounted) return;
				setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	const filtered = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		let result = items;
		if (term) {
			result = result.filter((item) =>
				[item.name, item.code].some((value) => value.toLowerCase().includes(term))
			);
		}
		const sorted = [...result].sort((a, b) => {
			return sortOption === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
		});
		return sorted;
	}, [searchTerm, sortOption, items]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const currentPage = Math.min(page, totalPages);
	const startIndex = (currentPage - 1) * perPage;
	const endIndex = Math.min(startIndex + perPage, filtered.length);
	const displayItems = filtered.slice(startIndex, endIndex);

	const handleApply = () => {
		setSearchTerm(draftSearch);
		setSortOption(draftSort);
	};

	const handleEditClick = (item: Item) => {
		setEditingItem(item);
		setEditFormData({
			name: item.name,
			code: item.code,
			quantity: item.quantity,
			unit: item.unit,
			location: item.location,
		});
		setEditError(null);
		setShowEditModal(true);
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingItem || !editFormData.name || !editFormData.unit) {
			setEditError('Nama barang dan satuan tidak boleh kosong');
			return;
		}
		if (Number.isNaN(editFormData.quantity) || editFormData.quantity < 0) {
			setEditError('Jumlah stok harus 0 atau lebih');
			return;
		}

		setEditLoading(true);
		setEditError(null);
		try {
			await updateItem(editingItem.id, {
				nama_barang: editFormData.name,
				kode_barang: editFormData.code,
				qty: editFormData.quantity,
				satuan: editFormData.unit,
				lokasi_simpan: editFormData.location,
			});
			// Update local state
			setItems(items.map(item => 
				item.id === editingItem.id 
					? { ...item, name: editFormData.name, code: editFormData.code, quantity: editFormData.quantity, unit: editFormData.unit, location: editFormData.location }
					: item
			));
			setShowEditModal(false);
			setEditingItem(null);
		} catch (err: any) {
			setEditError(err.message || 'Gagal memperbarui item');
		} finally {
			setEditLoading(false);
		}
	};

	const handleTakeClick = (item: Item) => {
		if (item.quantity <= 0) {
			setTakeError('Barang ini habis, silahkan buat request');
			return;
		}
		setTakeItem_selected(item);
		setTakeQty(1);
		const today = new Date().toISOString().split('T')[0];
		setTakeDate(today);
		setTakePenerima('');
		setTakeError(null);
		setTakeMessage(null);
		setShowTakeModal(true);
	};

	const handleTakeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!takeItem_selected || takeQty <= 0) {
			setTakeError('Jumlah harus lebih dari 0');
			return;
		}
		if (takeQty > takeItem_selected.quantity) {
			setTakeError(`Stok hanya ${takeItem_selected.quantity}`);
			return;
		}
		if (!takePenerima.trim()) {
			setTakeError('Penerima tidak boleh kosong');
			return;
		}

		setTakeLoading(true);
		setTakeError(null);
		try {
			console.log('[TAKE_SUBMIT] Data yang dikirim:', {
				itemId: takeItem_selected.id,
				qty: takeQty,
				penerima: takePenerima,
			});
			await takeItem(takeItem_selected.id, takeQty, takePenerima);
			console.log('[TAKE_SUBMIT] Sukses ambil barang');
			setTakeMessage(`${takeItem_selected.name} (${takeQty} ${takeItem_selected.unit}) berhasil diambil`);
			setShowTakeModal(false);
			setTakeItem_selected(null);
			// Reload items
			const updated = await fetchItems();
			setItems(updated);
		} catch (err: any) {
			console.error('[TAKE_SUBMIT] Error:', err);
			setTakeError(err.message || 'Gagal mengambil barang');
		} finally {
			setTakeLoading(false);
		}
	};

	return (
		<div className="items-page">
			<div className="items-filters">
				<div className="search-control">
					<span className="search-icon" aria-hidden>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
							<circle cx="11" cy="11" r="7" />
							<path d="M16.5 16.5 21 21" strokeLinecap="round" />
						</svg>
					</span>
					<input
						className="input-control search-input"
						placeholder="Cari Barang atau Kode Barang..."
						value={draftSearch}
						onChange={(e) => setDraftSearch(e.target.value)}
					/>
				</div>
				<select
					className="select-control"
					aria-label="Urutkan berdasarkan jumlah"
					value={draftSort}
					onChange={(e) => setDraftSort(e.target.value as 'asc' | 'desc')}
				>
					<option value="asc">Jumlah Terkecil</option>
					<option value="desc">Jumlah Terbesar</option>
				</select>
				<Button type="button" className="apply-button" onClick={handleApply} variant="secondary">
					Terapkan
				</Button>
			</div>

			<div className="items-card">
				{error && <p className="danger-text" role="alert">{error}</p>}
				<Table>
					<THead>
						<TR>
							<TH style={{ width: '52px' }}>No</TH>
							<TH>Nama Barang</TH>
							<TH>Kode Barang</TH>
							<TH>Jumlah</TH>
							<TH>Satuan</TH>
							<TH>Lokasi Simpan</TH>
							<TH style={{ width: '160px' }}>Action</TH>
						</TR>
					</THead>
					<TBody>
						{loading ? (
							<TR>
								<TD colSpan={7} className="empty-row">Memuat data...</TD>
							</TR>
						) : displayItems.length === 0 ? (
							<TR>
								<TD colSpan={7} className="empty-row">Tidak ada data</TD>
							</TR>
						) : (
							displayItems.map((item, idx) => (
								<TR key={item.id}>
									<TD>{startIndex + idx + 1}</TD>
									<TD>{item.name}</TD>
									<TD>{item.code}</TD>
									<TD>{item.quantity.toLocaleString('id-ID')}</TD>
									<TD>{item.unit}</TD>
									<TD>{item.location}</TD>
									<TD>
										<div className="action-buttons">
											{canOperateStock ? (
												<Button type="button" variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
													✏ Edit
												</Button>
											) : (
												<Button 
													type="button" 
													variant={item.quantity > 0 ? 'primary' : 'secondary'} 
													size="sm" 
													onClick={() => handleTakeClick(item)}
													disabled={item.quantity <= 0}
												>
													{item.quantity > 0 ? '✓ Ambil' : 'Habis'}
												</Button>
											)}
										</div>
									</TD>
								</TR>
							))
						)}
					</TBody>
				</Table>

				<div className="items-footer">
					<span className="items-meta">
						Menampilkan {startIndex + 1} - {endIndex} dari {filtered.length} barang
					</span>
					<Pagination current={currentPage} total={totalPages} onChange={setPage} />
				</div>
			</div>

			{/* Edit Modal */}
			{showEditModal && (
				<div className="modal-overlay" onClick={() => setShowEditModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<h2 className="modal-title">Edit Barang</h2>
						{editError && <p className="danger-text">{editError}</p>}
						<form onSubmit={handleEditSubmit} className="edit-form">
							<div className="form-group">
								<label htmlFor="edit-name">Nama Barang *</label>
								<Input
									id="edit-name"
									type="text"
									value={editFormData.name}
									onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
									placeholder="Nama barang"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-code">Kode Barang</label>
								<Input
									id="edit-code"
									type="text"
									value={editFormData.code}
									onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
									placeholder="Kode barang"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-qty">Jumlah *</label>
								<Input
									id="edit-qty"
									type="number"
									min={0}
									value={editFormData.quantity}
									onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
									placeholder="Jumlah stok"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-unit">Satuan *</label>
								<Input
									id="edit-unit"
									type="text"
									value={editFormData.unit}
									onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
									placeholder="Satuan"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-location">Lokasi Simpan</label>
								<Input
									id="edit-location"
									type="text"
									value={editFormData.location}
									onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
									placeholder="Lokasi simpan"
								/>
							</div>
							<div className="form-actions">
								<Button type="submit" disabled={editLoading}>
									{editLoading ? 'Menyimpan...' : 'Simpan'}
								</Button>
								<Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
									Batal
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Take Item Modal */}
			{showTakeModal && takeItem_selected && (
				<div className="modal-overlay" onClick={() => setShowTakeModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
						<h2 className="modal-title">Form Ambil ATK</h2>
						{takeMessage && <p className="success-text">{takeMessage}</p>}
						{takeError && <p className="danger-text">{takeError}</p>}
						<form onSubmit={handleTakeSubmit} className="edit-form">
							<div className="form-group">
								<label htmlFor="take-name">Nama Barang</label>
								<Input
									id="take-name"
									type="text"
									value={takeItem_selected.name}
									disabled
									placeholder="Nama barang"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="take-date">Tanggal</label>
								<Input
									id="take-date"
									type="date"
									value={takeDate}
									onChange={(e) => setTakeDate(e.target.value)}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="take-qty">Jumlah</label>
								<Input
									id="take-qty"
									type="number"
									min="1"
									max={takeItem_selected.quantity}
									value={takeQty}
									onChange={(e) => setTakeQty(Math.max(1, parseInt(e.target.value) || 1))}
									placeholder="Jumlah"
									required
								/>
								<p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
									Stok tersedia: {takeItem_selected.quantity}
								</p>
							</div>
							<div className="form-group">
								<label htmlFor="take-unit">Satuan</label>
								<Input
									id="take-unit"
									type="text"
									value={takeItem_selected.unit}
									disabled
									placeholder="Satuan"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="take-penerima">Penerima</label>
								<Input
									id="take-penerima"
									type="text"
									value={takePenerima}
									onChange={(e) => setTakePenerima(e.target.value)}
									placeholder="Nama penerima"
									required
								/>
							</div>
							<div className="form-actions">
								<Button type="submit" disabled={takeLoading}>
									{takeLoading ? 'Menyimpan...' : 'Simpan'}
								</Button>
								<Button type="button" variant="secondary" onClick={() => setShowTakeModal(false)}>
									Batal
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AtkItems;
