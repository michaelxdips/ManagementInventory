import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import GuestLayout from '../layouts/GuestLayout';
import Approval from '../pages/Approval';
import AtkItems from '../pages/AtkItems';
import BarangKosong from '../pages/BarangKosong';
import Dashboard from '../pages/Dashboard';
import HistoryKeluar from '../pages/HistoryKeluar';
import HistoryMasuk from '../pages/HistoryMasuk';
import Information from '../pages/Information';
import Login from '../pages/auth/Login';
import ManageUnits from '../pages/ManageUnits';
import ManageUnitsCreate from '../pages/ManageUnitsCreate';
import PasswordSettings from '../pages/PasswordSettings';
import ProfileSettings from '../pages/ProfileSettings';
import Requests from '../pages/Requests';
import RequestsCreate from '../pages/RequestsCreate';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
	return (
		<Routes>
			<Route element={<GuestLayout />}>
				<Route index element={<Login />} />
			</Route>

			<Route element={<ProtectedRoute />}>
				<Route element={<AuthLayout />}>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/items" element={<AtkItems />} />
				<Route element={<RoleRoute allow={["user"]} />}>
					<Route path="/requests" element={<Requests />} />
					<Route path="/requests/create" element={<RequestsCreate />} />
					<Route path="/information" element={<Information />} />
				<Route path="/barang-kosong" element={<BarangKosong />} />
			</Route>
			<Route element={<RoleRoute allow={["admin", "superadmin"]} />}>
				<Route path="/history-masuk" element={<HistoryMasuk />} />
				<Route path="/history-keluar" element={<HistoryKeluar />} />
				<Route path="/approval" element={<Approval />} />
					<Route path="/manage-units" element={<ManageUnits />} />
					<Route path="/manage-units/create" element={<ManageUnitsCreate />} />
				</Route>
					<Route path="/settings" element={<ProfileSettings />} />
					<Route path="/settings/password" element={<PasswordSettings />} />
				</Route>
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default AppRoutes;
