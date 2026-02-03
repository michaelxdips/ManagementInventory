import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { fetchItems, Item, updateItem } from '../api/items.api';
import { createRequest } from '../api/requests.api';
import useAuth from '../hooks/useAuth';

interface EditFormData {
	name: string;
	code: string;
	quantity: number;
	unit: string;
	location: string;
}

const AtkItems = () => {
	const navigate = useNavigate();
	const { hasRole, user } = useAuth();
	const isSuperadmin = hasRole(['superadmin']);
	const isAdminOrSuperadmin = hasRole(['admin', 'superadmin']);
	const isUser = hasRole(['user']);

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
	// Request modal for users
	const [showRequestModal, setShowRequestModal] = useState(false);
	const [requestItem, setRequestItem] = useState<Item | null>(null);
	const [requestQty, setRequestQty] = useState(1);
	const [requestPenerima, setRequestPenerima] = useState('');
	const [requestLoading, setRequestLoading] = useState(false);
	const [requestError, setRequestError] = useState<string | null>(null);
	const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

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
				setItems([]);
				setError('Gagal memuat data ATK dari server');
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
				[item.name, item.code].some((value) => value?.toLowerCase().includes(term))
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
		if (!isSuperadmin) {
			setEditError('Hanya superadmin yang dapat mengubah stok atau data item');
			return;
		}
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

	// User: Open request modal instead of direct take
	const handleRequestClick = (item: Item) => {
		if (item.quantity <= 0) {
			setRequestError('Barang ini habis');
			return;
		}
		setRequestItem(item);
		setRequestQty(1);
		setRequestPenerima('');
		setRequestError(null);
		setRequestSuccess(null);
		setShowRequestModal(true);
	};

	const handleRequestSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!requestItem || requestQty <= 0) {
			setRequestError('Jumlah harus lebih dari 0');
			return;
		}
		if (requestQty > requestItem.quantity) {
			setRequestError(`Stok hanya ${requestItem.quantity}`);
			return;
		}
		if (!requestPenerima.trim()) {
			setRequestError('Penerima tidak boleh kosong');
			return;
		}

		setRequestLoading(true);
		setRequestError(null);
		try {
			const today = new Date().toISOString().split('T')[0];
			await createRequest({
				date: today,
				item: requestItem.name,
				qty: requestQty,
				unit: requestItem.unit,
				receiver: requestPenerima,
				dept: user?.name || 'Unknown',
			});
			setRequestSuccess(`Request untuk ${requestItem.name} (${requestQty} ${requestItem.unit}) berhasil diajukan. Menunggu persetujuan admin.`);
			setTimeout(() => {
				setShowRequestModal(false);
				setRequestItem(null);
			}, 2000);
		} catch (err: any) {
			setRequestError(err.message || 'Gagal membuat request');
		} finally {
			setRequestLoading(false);
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
				{!isSuperadmin && isAdminOrSuperadmin && (
					<p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
						Hanya superadmin yang dapat mengubah stok. Silakan hubungi superadmin untuk update stok.
					</p>
				)}
				{isUser && (
					<p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
						Klik "Ambil" untuk mengajukan permintaan barang. Admin akan menyetujui permintaan Anda.
					</p>
				)}
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
									<TD>{item.code || '-'}</TD>
									<TD>{item.quantity.toLocaleString('id-ID')}</TD>
									<TD>{item.unit}</TD>
									<TD>{item.location || '-'}</TD>
									<TD>
										<div className="action-buttons">
											{isSuperadmin ? (
												<Button type="button" variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
													✏ Edit
												</Button>
											) : isAdminOrSuperadmin ? (
												<span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
											) : (
												<Button
													type="button"
													variant={item.quantity > 0 ? 'secondary' : 'ghost'}
													size="sm"
													onClick={() => handleRequestClick(item)}
													disabled={item.quantity <= 0}
												>
													{item.quantity > 0 ? '📦 Ambil' : 'Habis'}
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

			{/* Edit Modal - Superadmin Only */}
			<Modal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				title="Edit Barang"
				footer={
					<div className="form-actions">
						<Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
							Batal
						</Button>
						<Button type="submit" form="edit-form" disabled={editLoading}>
							{editLoading ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</div>
				}
			>
				{editError && <p className="danger-text">{editError}</p>}
				<form id="edit-form" onSubmit={handleEditSubmit} className="edit-form">
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
				</form>
			</Modal>

			{/* Request Modal - User Role */}
			<Modal
				isOpen={showRequestModal && !!requestItem}
				onClose={() => setShowRequestModal(false)}
				title="Ambil Barang"
				footer={
					<div className="form-actions">
						<Button type="button" variant="secondary" onClick={() => setShowRequestModal(false)}>
							Batal
						</Button>
						<Button type="submit" form="request-form" disabled={requestLoading || !!requestSuccess}>
							{requestLoading ? 'Memproses...' : 'Ajukan Permintaan'}
						</Button>
					</div>
				}
			>
				{requestSuccess && (
					<div style={{
						padding: '12px 16px',
						background: 'var(--success-bg, #d4edda)',
						color: 'var(--success-text, #155724)',
						borderRadius: '6px',
						marginBottom: '16px'
					}}>
						{requestSuccess}
					</div>
				)}
				{requestError && <p className="danger-text">{requestError}</p>}
				{requestItem && (
					<form id="request-form" onSubmit={handleRequestSubmit} className="edit-form">
						<div className="form-group">
							<label htmlFor="req-name">Nama Barang</label>
							<Input
								id="req-name"
								type="text"
								value={requestItem.name}
								disabled
							/>
						</div>
						<div className="form-group">
							<label htmlFor="req-qty">Jumlah Request</label>
							<Input
								id="req-qty"
								type="number"
								min="1"
								max={requestItem.quantity}
								value={requestQty}
								onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value) || 1))}
								required
							/>
							<p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
								Stok tersedia: {requestItem.quantity} {requestItem.unit}
							</p>
						</div>
						<div className="form-group">
							<label htmlFor="req-penerima">Penerima *</label>
							<Input
								id="req-penerima"
								type="text"
								value={requestPenerima}
								onChange={(e) => setRequestPenerima(e.target.value)}
								placeholder="Nama penerima"
								required
							/>
						</div>
					</form>
				)}
			</Modal>
		</div>
	);
};

export default AtkItems;
