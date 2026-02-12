import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutSwitcher } from '../components/Layout';
import GuestLayout from '../layouts/GuestLayout';
import Approval from '../pages/Approval';
import ApprovalFinalize from '../pages/ApprovalFinalize';
import AtkItems from '../pages/AtkItems';
import BarangKosong from '../pages/BarangKosong';
import BarangMasukCreate from '../pages/BarangMasukCreate';
import Dashboard from '../pages/Dashboard';
import HistoryKeluar from '../pages/HistoryKeluar';
import HistoryMasuk from '../pages/HistoryMasuk';
import Information from '../pages/Information';
import Login from '../pages/auth/Login';
import ManageUnits from '../pages/ManageUnits';
import ManageUnitsCreate from '../pages/ManageUnitsCreate';
import ManageQuota from '../pages/ManageQuota';
import PasswordSettings from '../pages/PasswordSettings';
import ProfileSettings from '../pages/ProfileSettings';
import Requests from '../pages/Requests';
import RequestsCreate from '../pages/RequestsCreate';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
	return (
		<Routes>
			{/* Guest Routes - Login */}
			<Route element={<GuestLayout />}>
				<Route index element={<Login />} />
			</Route>

			{/* Protected Routes - Authenticated Users */}
			<Route element={<ProtectedRoute />}>
				{/* LayoutSwitcher automatically selects desktop/mobile layout */}
				<Route element={<LayoutSwitcher />}>
					{/* Common routes for all authenticated users */}
					<Route path="/dashboard" element={<Dashboard />} />

					<Route path="/items" element={<AtkItems />} />
					<Route path="/settings" element={<ProfileSettings />} />
					<Route path="/settings/password" element={<PasswordSettings />} />

					{/* User role routes */}
					<Route element={<RoleRoute allow={["user"]} />}>
						<Route path="/requests" element={<Requests />} />
						<Route path="/requests/create" element={<RequestsCreate />} />
						<Route path="/information" element={<Information />} />
					</Route>

					{/* Admin/Superadmin role routes */}
					<Route element={<RoleRoute allow={["admin", "superadmin"]} />}>
						<Route path="/barang-masuk/create" element={<BarangMasukCreate />} />
						<Route path="/history-masuk" element={<HistoryMasuk />} />
						<Route path="/history-keluar" element={<HistoryKeluar />} />
						<Route path="/barang-kosong" element={<BarangKosong />} />
						<Route path="/approval" element={<Approval />} />
						<Route path="/approval/:id/finalize" element={<ApprovalFinalize />} />
					</Route>

					{/* Superadmin only routes */}
					<Route element={<RoleRoute allow={["superadmin"]} />}>
						<Route path="/manage-units" element={<ManageUnits />} />
						<Route path="/manage-units/create" element={<ManageUnitsCreate />} />
						<Route path="/manage-quota" element={<ManageQuota />} />
					</Route>
				</Route>
			</Route>

			{/* Catch all - redirect to home */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default AppRoutes;
