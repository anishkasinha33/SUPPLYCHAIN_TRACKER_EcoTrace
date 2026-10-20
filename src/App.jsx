import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PassportPage from './pages/PassportPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import SupplierDetailPage from './pages/SupplierDetailPage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import MaterialDetailPage from './pages/MaterialDetailPage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import ProviderDetailPage from './pages/ProviderDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import SustainabilityPage from './pages/SustainabilityPage.jsx';
import ConsumerViewPage from './pages/ConsumerViewPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/p/:traceId" element={<PassportPage />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Signed-in app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/consumer-view" element={<ConsumerViewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
