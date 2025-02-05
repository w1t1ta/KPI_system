import React, { useEffect, useState } from 'react';
import './Branch_Assessment.css';

const FeedbackForm = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [sheetData, setSheetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from Google Sheets
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://docs.google.com/spreadsheets/d/1QdiKQyx_9qeFrrpQjJyW_sjYxpGOGHyYGRStpKEYk4U/gviz/tq?tqx=out:json');
                const text = await response.text();
                const jsonData = JSON.parse(text.substr(47).slice(0, -2)); // Remove unnecessary text
                const rows = jsonData.table.rows.map(row => row.c.map(cell => cell ? cell.v : null));
                setSheetData(rows);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('ไม่สามารถดึงข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to handle date change
    const handleDateChange = (e) => {
        const selected = new Date(e.target.value);
        const formattedDate = `${selected.getDate().toString().padStart(2, '0')}/${(selected.getMonth() + 1).toString().padStart(2, '0')}/${selected.getFullYear()}`;
        setSelectedDate(formattedDate);
    };

    // Function to reset the filter
    const handleReset = () => {
        setSelectedDate(''); // Reset selected date
        document.getElementById('evaluation-date').value = ''; // Reset the input field
    };

    // Function to format date and time
    const formatDateTime = (cell) => {
        const dateRegex = /Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/;
        const match = cell.match(dateRegex);
        let date;

        if (match) {
            date = new Date(match[1], match[2], match[3], match[4], match[5], match[6]);
        } else {
            date = new Date(cell);
        }

        if (!isNaN(date.getTime())) {
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
            return `${formattedDate}, ${formattedTime}`; // Return formatted date and time
        }

        return cell; // Return original cell if it can't be converted
    };

    // Filter rows based on selected date
    const filteredData = selectedDate ? sheetData.filter(row => formatDateTime(row[0]).startsWith(selectedDate)) : sheetData;

    return (
        <div className="box">
            <div className="container-content">
                <h1>รายการประเมิน</h1>

                <div className="container-content">
                    <label htmlFor="evaluation-date">วันที่ส่งแบบประเมิน</label>
                    <div className='select-date'>
                    <input
                        type="date"
                        id="evaluation-date"
                        className="date-picker"
                        onChange={handleDateChange}
                    />
                    <button onClick={handleReset} className="reset-button">รีเซ็ต</button>
                    </div>
                </div>

                <div className="container-content">
                    <label htmlFor="form-info">ข้อมูลแบบฟอร์มการประเมิน</label>
                    {loading ? (
                        <div>กำลังโหลดข้อมูล...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>วันที่ส่งแบบประเมิน</th>
                                    <th>ขั้นตอนการบริการมีความเหมาะสม สะดวก เข้าใจง่าย</th>
                                    <th>ระยะเวลาการให้บริการมีความเหมาะสม</th>
                                    <th>ให้คำแนะนำและตอบข้อซักถามอย่างเจน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{formatDateTime(row[0])}</td>
                                        <td>{row[1]}</td>
                                        <td>{row[2]}</td>
                                        <td>{row[3]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
