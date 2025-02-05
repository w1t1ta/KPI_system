import React, { useState } from 'react';
import './Branch_Assessment.css';

const FeedbackForm = () => {
    // State to store feedback, date, and pop-up visibility
    const [feedback, setFeedback] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const formData = {
        formName: 'แบบประเมินความพึงพอใจ',
        formUrl:
            'https://docs.google.com/spreadsheets/d/1QdiKQyx_9qeFrrpQjJyW_sjYxpGOGHyYGRStpKEYk4U/edit?resourcekey=&gid=1561318503#gid=1561318503',
    };

    // Function to handle date change
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Function to handle feedback change
    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า
        console.log('Selected Date:', selectedDate);
        console.log('Feedback:', feedback);

        // แสดง Pop-Up
        setShowPopup(true);

        // ปิด Pop-Up หลังจาก 2 วินาที
        setTimeout(() => {
            setShowPopup(false);
            // รีเซ็ตฟอร์มหลังจากส่งข้อมูล
            setSelectedDate('');
            setFeedback('');
        }, 2000);
    };

    return (
        <div className="box">
            <div className="container-content">
                <h1>{formData.formName}</h1>

                <form onSubmit={handleSubmit}>
                    <div className="container-content">
                        <label htmlFor="evaluation-date">วันที่ส่งแบบประเมิน</label>
                        <input
                            type="date"
                            id="evaluation-date"
                            className="date-picker"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="container-content">
                        <label>ความคิดเห็นเพิ่มเติม</label>
                        <textarea
                            value={feedback}
                            onChange={handleFeedbackChange}
                            placeholder="กรุณาใส่ความคิดเห็นของคุณที่นี่"
                            rows="4" // กำหนดจำนวนแถว
                            className="feedback-textarea" // กำหนดคลาสเพื่อสไตล์
                        />
                    </div>
                    <button type="submit">ยืนยัน</button>
                </form>
            </div>

            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <p>ส่งข้อมูลเรียบร้อยแล้ว!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackForm;
