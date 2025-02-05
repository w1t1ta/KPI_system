import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from './pages/login'; // ตรวจสอบให้แน่ใจว่าชื่อไฟล์และเส้นทางถูกต้อง
import AssessmentEmployees from './pages/AssessmentEmployees';
import Branch_Assessment from './pages/Branch_Assessment';
import Navbar from "./components/Navbar";
import SelfAssessment from "./pages/selfAssessment";
import Cowork from "./pages/Assessment_co_work";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true"); // จัดเก็บสถานะการล็อกอิน
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // ลบสถานะการล็อกอิน
  };

  React.useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    if (loggedInStatus) {
      setIsLoggedIn(true); // ตรวจสอบสถานะการล็อกอินเมื่อเริ่มต้น
    }
  }, []);

  return (
    <Router>
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        {/* กำหนดเส้นทางเริ่มต้นไปที่หน้า login */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/assessment-employees" /> : <Navigate to="/login" />} />

        {/* เส้นทางหน้าล็อกอิน */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/assessment-employees" /> : <Login onLogin={handleLogin} />} />

        {/* เส้นทางหน้า AssessmentEmployees */}
        <Route path="/assessment-employees" element={isLoggedIn ? <AssessmentEmployees /> : <Navigate to="/login" />} />

        {/* เส้นทางหน้า Branch Assessment */}
        <Route path="/branch-assessment" element={isLoggedIn ? <Branch_Assessment /> : <Navigate to="/login" />} />

        {/* เส้นทางหน้า SelfAssessment */}
        <Route path="/self-assessment" element={isLoggedIn ? <SelfAssessment /> : <Navigate to="/login" />} />
        {/* เส้นทางหน้า Assessment_co_work*/}
        <Route path="/cowork" element={isLoggedIn ? <Cowork /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
