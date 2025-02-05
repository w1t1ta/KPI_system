import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Navbar.css';

function Navbar({ onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [username, setUsername] = useState("test@example.com"); // ตัวอย่าง user (ลบได้)
    const navigate = useNavigate();

    // ฟังก์ชันเปิด/ปิด dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    // ฟังก์ชันสำหรับจัดการการคลิกนอก dropdown
    const handleClickOutside = (event) => {
        const dropdownMenu = document.getElementById("dropdownMenu");
        const profileIcon = document.getElementById("profileIcon");
        if (dropdownMenu && !dropdownMenu.contains(event.target) && !profileIcon.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // ฟังก์ชันออกจากระบบ
    const handleLogout = () => {
        onLogout(); // เรียกใช้ฟังก์ชัน onLogout ที่ส่งมาจาก App.js
        navigate('/'); // นำทางไปยังหน้า Login
    };

    return (
        <header>
            <div className="logo">
                <img src="https://img.advice.co.th/images_nas/advice/oneweb/assets/images/logo.png" alt="advice" width="150" />
            </div>
            <nav>
                <ul>
                    <li><Link to="/assessment-employees">ประเมินพนักงาน</Link></li>
                    <li><Link to="/cowork">ประเมินเพื่อนร่วมงาน</Link></li>
                    <li><Link to="/self-assessment">ประเมินตนเอง</Link></li>
                    <li><Link to="/branch-assessment">ประเมินสาขา</Link></li>
                </ul>
                <div className="navbar">
                    <div className="profile-container" onClick={toggleDropdown}>
                        <div className="profile">
                            <img
                                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhF8cgX6-fG1SeQJOE_iCU08xEmxwsaGfloMG_4S6JH0fUux33VXM1q-PN1fYahj7Qn-eKtjF-IUYQ5k-dwdh67DBZfaOGp93qG_g_v_ORDlTXeJzWWVBf43AduHclEChhGX6j1lITfgO281i0RFxNwjUJr4EN1qKaca7Xc323pd8W3ZwTU9t3SU1C1PNE/s1794/acc.png"
                                alt="profileicon"
                                id="profileIcon"
                                width="30"
                            />
                            {isDropdownOpen && (
                                <div className="dropdown" id="dropdownMenu">
                                    <p id="usernameDisplay">{username}</p> {/* ใส่ชื่อผู้ใช้ */}
                                    <button id="logoutButton" onClick={handleLogout}>Log out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
