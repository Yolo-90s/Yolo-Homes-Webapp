import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Splash from "./components/Splash";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Maintenance from "./pages/maintenance/MaintenancePanel";
import AddMaintenance from "./pages/maintenance/AddMaintenance";
import MaintenanceHistory from "./pages/maintenance/MaintenanceHistory";
import ReceiptDetail from "./pages/maintenance/ReceiptDetail";
import Water from "./pages/water/WaterPanel";
import AddReading from "./pages/water/AddReading";
import WaterHistory from "./pages/water/WaterHistory";
import FlatConsumption from "./pages/water/FlatConsumption";
import WaterReport from "./pages/water/WaterReport";
import WaterBill from "./pages/water/WaterBill";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ManageResidents from "./pages/ManageResidents";

function Shell() {
  const { session, loading } = useAuth();
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 2700);
    return () => clearTimeout(t);
  }, []);

  if (!bootDone || loading) return <Splash />;
  if (!session) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Maintenance />} />
        <Route path="/maintenance/add" element={<AddMaintenance />} />
        <Route path="/maintenance/history" element={<MaintenanceHistory />} />
        <Route path="/maintenance/receipt/:id" element={<ReceiptDetail />} />
        <Route path="/water" element={<Water />} />
        <Route path="/water/add" element={<AddReading />} />
        <Route path="/water/history" element={<WaterHistory />} />
        <Route path="/water/consumption" element={<FlatConsumption />} />
        <Route path="/water/report" element={<WaterReport />} />
        <Route path="/water/bill/:id" element={<WaterBill />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/residents" element={<ManageResidents />} />
        <Route path="*" element={<Maintenance />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
