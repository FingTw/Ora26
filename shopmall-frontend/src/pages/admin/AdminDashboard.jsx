import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

// Simple bar chart using pure CSS/SVG
const BarChart = ({ data, labelKey, valueKey, color = "#6366f1", title }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm py-4 text-center">Không có dữ liệu</p>;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0)) || 1;
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      <div className="space-y-3">
        {data.map((item, i) => {
          const val = Number(item[valueKey]) || 0;
          const pct = Math.round((val / max) * 100);
          return (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="truncate max-w-[180px]" title={item[labelKey]}>{item[labelKey]}</span>
                <span className="font-bold ml-2">{typeof val === 'number' && val > 1000 ? val.toLocaleString() : val}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-5">
                <div
                  className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                >
                  <span className="text-white text-xs font-bold">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut chart using SVG
const DonutChart = ({ data, labelKey, valueKey, title }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm py-4 text-center">Không có dữ liệu</p>;
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  
  let offset = 0;
  const slices = data.map((d, i) => {
    const val = Number(d[valueKey]) || 0;
    const pct = total > 0 ? (val / total) * 100 : 0;
    const slice = { label: d[labelKey], val, pct, color: COLORS[i % COLORS.length], offset };
    offset += pct;
    return slice;
  });

  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => {
            const dashArray = (s.pct / 100) * circumference;
            const dashOffset = circumference - (s.offset / 100) * circumference;
            return (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="transparent"
                stroke={s.color}
                strokeWidth="28"
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })}
          <text x={cx} y={cy - 5} textAnchor="middle" className="text-xs" fill="#374151" fontSize="12" fontWeight="bold">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" fontSize="10">Tổng</text>
        </svg>
        <div className="space-y-2 flex-1">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></span>
              <span className="text-gray-700 flex-1 truncate">{s.label}</span>
              <span className="font-bold text-gray-800">{s.val} <span className="text-gray-400 font-normal">({Math.round(s.pct)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dbResult, chartResult] = await Promise.allSettled([
          adminService.getDashboard(),
          adminService.getChartData()
        ]);
        if (dbResult.status === "fulfilled" && dbResult.value?.success) {
          setStats(dbResult.value.data);
        }
        if (chartResult.status === "fulfilled" && chartResult.value?.success) {
          setCharts(chartResult.value.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
      Đang tải...
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm">Tổng quan hệ thống ShopMall</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Tài khoản" value={stats.TONG_TAIKHOAN} icon="👥" color="bg-blue-50" />
        <StatCard label="Cửa hàng" value={stats.TONG_CUAHANG} icon="🏪" color="bg-green-50" />
        <StatCard label="Sản phẩm" value={stats.TONG_SANPHAM} icon="📦" color="bg-yellow-50" />
        <StatCard label="Hóa đơn" value={stats.TONG_HOADON} icon="🧾" color="bg-purple-50" />
        <StatCard
          label="Doanh thu"
          value={stats.DOANHTHU_HETHONG ? `${Number(stats.DOANHTHU_HETHONG).toLocaleString()}đ` : "0đ"}
          icon="💰"
          color="bg-red-50"
        />
      </div>

      {/* Charts grid */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <DonutChart
              data={charts.orderStatus}
              labelKey="TRANGTHAI"
              valueKey="SOLUONG"
              title="Trạng thái đơn hàng"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <DonutChart
              data={charts.userByRole}
              labelKey="TENVAITRO"
              valueKey="SOLUONG"
              title="Phân bổ người dùng theo vai trò"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <BarChart
              data={charts.productByCategory}
              labelKey="TENLOAI"
              valueKey="SOLUONG"
              color="#10b981"
              title="Số lượng sản phẩm theo danh mục"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <BarChart
              data={charts.topShops}
              labelKey="TENCH"
              valueKey="DOANHTHU"
              color="#6366f1"
              title="Top 5 cửa hàng doanh thu cao nhất (đ)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
