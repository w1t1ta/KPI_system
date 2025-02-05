import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../index.css'; // ตรวจสอบให้แน่ใจว่าเส้นทางถูกต้อง

function Login({ onLogin }) { // เพิ่ม onLogin เป็น props
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Form submitted"); // ตรวจสอบว่า form ถูกส่ง

    if (email === "test@example.com" && password === "password") {
      onLogin(); // เรียกใช้ onLogin เมื่อเข้าสู่ระบบสำเร็จ
      navigate("/assessment-employees");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container">
      <div className="logo">
        <img src="advicelogo.png" alt="Logo" />
      </div>
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // เพิ่ม required สำหรับการตรวจสอบความถูกต้อง
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // เพิ่ม required สำหรับการตรวจสอบความถูกต้อง
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
