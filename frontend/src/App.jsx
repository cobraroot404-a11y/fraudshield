import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Marketplace  from "./pages/Marketplace";
import AllTransactionsPage from "./pages/AllTransactionsPage";
import FlaggedPage from "./pages/FlaggedPage";
import AdmingReports from "./pages/AdminReports";
import AnalystDashboard from "./pages/AnalystDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/flagged" element={<FlaggedPage />} />
        <Route path="/admin/transactions" element={<AdminDashboard />} />
        <Route path="/analyst" element={<AnalystDashboard />} />
        <Route path="/admin/flagged" element={<FlaggedPage />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdmingReports />} />
        <Route path="/all-transactions" element={<AllTransactionsPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
