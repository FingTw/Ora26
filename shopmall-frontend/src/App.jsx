import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import { CartProvider } from "./contexts/CartContext";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminShops from "./pages/admin/AdminShops";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchPage from "./pages/SearchPage";
import ShopRegistration from "./pages/seller/ShopRegistration";
import ShopManagement from "./pages/seller/ShopManagement";
import ProductDetail from "./pages/ProductDetail";
import OrderHistory from "./pages/OrderHistory";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const ShopLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ShopLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="cart" element={<Cart />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="shop/register" element={<ShopRegistration />} />
            <Route path="shop/management" element={<ShopManagement />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="user/orders" element={<OrderHistory />} />
            <Route path="checkout-success" element={<CheckoutSuccess />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="shops" element={<AdminShops />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
