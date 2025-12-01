import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- Pages & Components ---
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import Header from "../components/Header";
import PrivateRoute from "../components/PrivateRoute";
import ForgotPasswordPage from "../pages/ResetPasswordPage";
import Footer from "../components/Footer";
import CategoryPage from "../pages/CategoryPage";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import ProductPage from "../pages/ProductPage";
import WarrantyPolicyPage from "../pages/WarrantyPolicyPage";
import StoreSystemPage from "../pages/StoreSystemPage";
import UserGuideProPage from "../pages/UserGuideProPage";
import MemberPolicyPage from "../pages/MemberPolicyPage";
import AboutPage from "../pages/AboutPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import CheckoutPage from "../pages/CheckoutPage";
import PaymentResultPage from "../pages/PaymentResultPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import ReviewPage from "../pages/ReviewPage";
import UserLayout from "../layouts/UserLayout";

// --- Admin Components (NEW) ---
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import OrderManager from "../pages/admin/OrderManager";
import UserManager from "../pages/admin/UserManager";
import ProductManager from "../pages/admin/ProductManager";
import ProductForm from "../pages/admin/ProductForm";
import DiscountManager from "../pages/admin/DiscountManager";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* USER LAYOUT */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/products" element={<ProductPage />} />

          <Route path="/warrant-policy" element={<WarrantyPolicyPage />} />
          <Route path="/store-system" element={<StoreSystemPage />} />
          <Route path="/user-guide-pro" element={<UserGuideProPage />} />
          <Route path="/member-policy" element={<MemberPolicyPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Private User Routes */}
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/vnpay-return"
            element={
              <PrivateRoute>
                <PaymentResultPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/order-history"
            element={
              <PrivateRoute>
                <OrderHistoryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/order-detail/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/product/:productId/review"
            element={
              <PrivateRoute>
                <ReviewPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* ADMIN LAYOUT */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="discounts" element={<DiscountManager />} />
        </Route>
      </Routes>
    </Router>
  );
}
