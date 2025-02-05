import React, { useEffect, useState } from 'react';
import './AssessmentEmployees.css';

const GET_EMPLOYEES = '/api/v1/employees';

// คอมโพเนนต์สำหรับแสดงปุ่มวิทยุ
const RatingInput = ({ score, onChange, criteriaId }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {["5", "4", "3", "2", "1"].map((value, index) => (
        <label key={index} style={{ marginRight: "10px" }}>
          <input
            type="radio"
            value={value}
            checked={score === Number(value)}
            onChange={() => onChange(criteriaId, Number(value))}
          />
          {value === "5" && "ดีมาก"}
          {value === "4" && "ดี"}
          {value === "3" && "ปานกลาง"}
          {value === "2" && "พอใช้"}
          {value === "1" && "ปรับปรุง"}
        </label>
      ))}
    </div>
  );
};

const FormData = () => {
  const initialFormData = {
    evaluatorInfo: "",
    additionalComments: "",
    em_id: "",
    branch_id: "",
    branch_name: "",
    role_id: "",
    role_name: "",
    em_age: "",
    em_phone: "",
    em_email: ""
  };

  const initialEvaluationCriteria = [
    { id: 1, name: "ข้อ1 ความรู้และ Skill ในการทำงาน", score: "" },
    { id: 2, name: "ข้อ2 ทักษะการสื่อสาร", score: "" },
    { id: 3, name: "ข้อ3 ลักษณะการแต่งกาย", score: "" },
    { id: 4, name: "ข้อ4 มีความรับผิดชอบต่อหน้าที่การงาน", score: "" },
    { id: 5, name: "ข้อ5 ปฎิบัติตามกฏเกณฑ์ ระเบียบ และข้อบังคับ", score: "" },
    { id: 6, name: "ข้อ6 ทัศนคติ", score: "" },
    { id: 7, name: "ข้อ7 มีมนุษย์สัมพันธ์กับเพื่อนร่วมงาน", score: "" },
    { id: 8, name: "ข้อ8 เคารพเพื่อนร่วมงาน", score: "" },
    { id: 9, name: "ข้อ9 มีความพยายามปรับปรุงและพัฒนา", score: "" },
    { id: 10, name: "ข้อ10 ความน่าไว้วางใจในการทำงาน", score: "" },
  ];

  const [formData, setFormData] = useState(initialFormData);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState(initialEvaluationCriteria);
  const [showPopup, setShowPopup] = useState(false); // State สำหรับ Pop-Up

  const updateScore = (id, newScore) => {
    const updatedCriteria = evaluationCriteria.map((criteria) =>
      criteria.id === id ? { ...criteria, score: newScore } : criteria
    );
    setEvaluationCriteria(updatedCriteria);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "manager") {
      setFormData(prev => ({
        ...prev,
        evaluatorInfo: e.target.value,
      }));
    }
    
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEvaluationCriteria(initialEvaluationCriteria);
    // หากคุณต้องการตั้งค่า evaluation_date ใหม่ในนี้ ก็สามารถทำได้
    setFormData(prev => ({
      ...prev,
      evaluation_date: new Date().toISOString().split('T')[0], // วันที่ปัจจุบัน
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Employee Evaluations:", evaluationCriteria);

    // แสดง Pop-Up
    setShowPopup(true);
    // ปิด Pop-Up หลังจาก 2 วินาที
    setTimeout(() => {
      setShowPopup(false);
      resetForm(); // รีเซ็ตฟอร์มหลังจากส่งข้อมูล
    }, 2000);
  };

  const handleSelectChange = (e) => {
    const selectedEmployeeId = Number(e.target.value);

    if (Array.isArray(employees) && employees.length > 0 && selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.em_id === selectedEmployeeId);

      if (selectedEmployee) {
        setFormData({
          ...formData,
          em_id: selectedEmployee.em_id.toString(),
          branch_id: selectedEmployee.branch_id ? selectedEmployee.branch_id.toString() : "",
          branch_name: selectedEmployee.branch_name || "",
          role_id: selectedEmployee.role_id ? selectedEmployee.role_id.toString() : "",
          role_name: selectedEmployee.role_name || "",
          em_age: selectedEmployee.em_age ? selectedEmployee.em_age.toString() : "",
          em_phone: selectedEmployee.em_phone || "",
          em_email: selectedEmployee.em_email || "",
        });
      } else {
        console.error('Selected employee not found');
      }
    } else {
      console.error('Employees data is not available or invalid');
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(GET_EMPLOYEES);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees: ', error);
        setError('ไม่สามารถดึงข้อมูลพนักงานได้');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <form className="form-db" onSubmit={handleSubmit}>
        <div className="Box-one">
          <div className="box-employees">
            <label>เลือกพนักงาน</label>
            <select
              name="employee"
              value={formData.em_id || ""}
              onChange={handleSelectChange}
            >
              <option value="" disabled>Select Employee</option>
              {employees
                .filter(employee => employee.role_id === 2)
                .map((employee) => (
                  <option key={employee.em_id} value={employee.em_id}>
                    {employee.em_id} - {employee.em_name}
                  </option>
                ))}
            </select>
          </div>

          <div className="box-date">
            <label htmlFor="evaluation-date">วันที่ส่งแบบประเมิน</label>
            <input
              type="date"
              id="evaluation-date"
              name="evaluation_date"
              className="date-picker"
              value={formData.evaluation_date}
              onChange={handleChange}
            />
          </div>


          <div className="box-manager">
            <label>เลือกผู้ประเมิน</label>
            <select
              name="manager"
              value={formData.evaluatorInfo || ""}
              onChange={handleChange}
            >
              <option value="" disabled>Select manager</option>
              {employees
                .filter(employee => employee.role_id === 1) // กรองเฉพาะผู้จัดการ
                .map((employee) => (
                  <option key={employee.em_id} value={employee.em_id}>
                    {employee.em_id} - {employee.em_name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="details-em">
          <div>
            <label className="block">รหัสพนักงาน</label>
            <input
              type="text"
              name="em_id"
              className="w-full border border-blue-500 p-2"
              value={formData.em_id || ""}
              readOnly
            />
          </div>
          <div>
            <label className="block">รหัสสาขา</label>
            <input
              type="text"
              name="branch_id"
              className="w-full border border-blue-500 p-2"
              value={`${formData.branch_id || ""} - ${formData.branch_name || ""}`}
              readOnly
            />
          </div>
          <div>
            <label className="block">อายุ</label>
            <input
              type="text"
              name="em_age"
              className="w-full border border-blue-500 p-2"
              value={formData.em_age || ""}
              readOnly
            />
          </div>
          <div>
            <label className="block">รหัสตำแหน่ง</label>
            <input
              type="text"
              name="role_id"
              className="w-full border border-blue-500 p-2"
              value={`${formData.role_id || ""} - ${formData.role_name || ""}`}
              readOnly
            />
          </div>
          <div>
            <label className="block">เบอร์โทร</label>
            <input
              type="text"
              name="em_phone"
              className="w-full border border-blue-500 p-2"
              value={formData.em_phone || ""}
              readOnly
            />
          </div>
          <div>
            <label className="block">Email</label>
            <input
              type="text"
              name="em_email"
              className="w-full border border-blue-500 p-2"
              value={formData.em_email || ""}
              readOnly
            />
          </div>
        </div>

        <table cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>หัวข้อการประเมิน</th>
              <th>ระดับการประเมิน</th>
            </tr>
          </thead>
          <tbody>
            {evaluationCriteria.map((criteria) => (
              <tr key={criteria.id}>
                <td>{criteria.name}</td>
                <td>
                  <RatingInput
                    score={criteria.score}
                    criteriaId={criteria.id}
                    onChange={updateScore}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <label>ความคิดเห็นเพิ่มเติม</label>
          <textarea
            name="additionalComments"
            value={formData.additionalComments}
            onChange={handleChange}
          />
        </div>

        <button type="submit">ยืนยัน</button>
      </form>

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

export default FormData;
