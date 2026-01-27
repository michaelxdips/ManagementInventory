import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchItems, Item } from '../api/items.api';
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
							{canOperateStock && <TH style={{ width: '140px' }}>Action</TH>}
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
							displayItems.map((item) => (
								<TR key={item.id}>
									<TD>{item.id}</TD>
									<TD>{item.name}</TD>
									<TD>{item.code}</TD>
									<TD>{item.quantity.toLocaleString('id-ID')}</TD>
									<TD>{item.unit}</TD>
									<TD>{item.location}</TD>
									{canOperateStock && (
										<TD>
											<div className="action-buttons">
												<Button type="button" variant="ghost" size="sm" disabled>
													Ambil
												</Button>
												<Button type="button" variant="ghost" size="sm" disabled>
													✏ Edit
												</Button>
											</div>
										</TD>
									)}
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
		</div>
	);
};

export default AtkItems;
