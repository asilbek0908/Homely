import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import AIChat from './components/AIChat';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import WorkerProfile from './pages/WorkerProfile';
import BookingConfirmation from './pages/BookingConfirmation';
import TelegramConnect from './pages/TelegramConnect';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboards
import CustomerDashboard from './pages/customer/Dashboard';
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerSetup from './pages/worker/WorkerSetup';
import SubscriptionPage from './pages/worker/SubscriptionPage';
import AdminDashboard from './pages/admin/Dashboard';
import PaymentPage from './pages/PaymentPage';

// Pages without Navbar/Footer
const FULL_PAGES = ['/login', '/register', '/worker/setup', '/verify-email', '/forgot-password', '/reset-password'];
const DASHBOARD_PAGES = ['/customer', '/worker', '/admin'];

const Layout = ({ children }) => {
  const path = window.location.pathname;
  const isFullPage = FULL_PAGES.some((p) => path.startsWith(p));
  const isDashboard = DASHBOARD_PAGES.some((p) => path.startsWith(p));
  if (isFullPage || isDashboard) return <>{children}</>;
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500">You don't have permission to view this page.</p>
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <AuthProvider>
      <SocketProvider>
        <NotificationToast />
        <AIChat />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workers" element={<Layout><SearchResults /></Layout>} />
          <Route path="/workers/:id" element={<Layout><WorkerProfile /></Layout>} />
          <Route path="/booking/confirm" element={<Layout><BookingConfirmation /></Layout>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/telegram-connect" element={
            <ProtectedRoute><TelegramConnect /></ProtectedRoute>
          } />

          {/* Customer */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute role="customer"><PaymentPage /></ProtectedRoute>
          } />

          {/* Worker */}
          <Route path="/worker/dashboard" element={
            <ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>
          } />
          <Route path="/worker/setup" element={
            <ProtectedRoute role="worker"><WorkerSetup /></ProtectedRoute>
          } />
          <Route path="/worker/subscription" element={
            <ProtectedRoute role="worker"><SubscriptionPage /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
