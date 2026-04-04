import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && Number(user.MAVAITRO) !== 1) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-4">
        <h1 className="text-3xl text-red-600 font-bold bg-red-100 p-4 border border-red-400 rounded-lg shadow-md">
          403 Forbiden: Quyền Truy Cập Bị Từ Chối
        </h1>
        <p className="text-gray-600">Bạn không phải là Quản trị viên (Role 1), không thể truy cập trang này.</p>
        <button 
          onClick={() => window.location.href="/"} 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
