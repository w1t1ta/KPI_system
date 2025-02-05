package handlers

import (
	"advice_backend/internal/advice"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// employeesHandler เป็น handler สำหรับจัดการ Employees
type employeesHandler struct {
	db advice.EmployeesDatabase // Changed to interface
}

// NewEmployeesHandler จะรับค่าฐานข้อมูลเข้ามาและส่งคืน handler สำหรับการใช้งาน
func NewEmployeesHandler(db advice.EmployeesDatabase) *employeesHandler {
	return &employeesHandler{db: db}
}

// GetEmployeeHandler จะดึงข้อมูลพนักงานตาม ID
func (h *employeesHandler) GetEmployeeHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	// ดึงข้อมูลพนักงานจาก database
	detail, err := h.db.GetEmployee(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, detail)
}

// AddEmployeeHandler จะเพิ่มข้อมูลพนักงาน
func (h *employeesHandler) AddEmployeeHandler(c *gin.Context) {
	var emp advice.Employee // Ensure you use the correct struct
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// เพิ่มข้อมูลลงใน database
	if err := h.db.AddEmployee(c.Request.Context(), emp.EmID, emp.EmName, emp.EmAge, emp.EmPhone, emp.EmEmail, emp.BranchID, emp.RoleID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add employee"})
		return
	}

	c.Status(http.StatusCreated)
}

// DeleteEmployeeHandler จะลบข้อมูลพนักงาน
func (h *employeesHandler) DeleteEmployeeHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	// ลบข้อมูลจาก database
	if err := h.db.DeleteEmployee(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// Role handlers
func (h *employeesHandler) GetRoleHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	role, err := h.db.GetRole(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

func (h *employeesHandler) AddRoleHandler(c *gin.Context) {
	var role advice.Role // Ensure you use the correct struct
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := h.db.AddRole(c.Request.Context(), role.RoleID, role.RoleName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add role"})
		return
	}

	c.Status(http.StatusCreated)
}

func (h *employeesHandler) DeleteRoleHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	if err := h.db.DeleteRole(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// Branch handlers
func (h *employeesHandler) GetBranchHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branch ID"})
		return
	}

	branch, err := h.db.GetBranch(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, branch)
}

func (h *employeesHandler) AddBranchHandler(c *gin.Context) {
	var branch advice.Branch // Ensure you use the correct struct
	if err := c.ShouldBindJSON(&branch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := h.db.AddBranch(c.Request.Context(), branch.BranchID, branch.BranchName, branch.BranchDistrict, branch.BranchCountry); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add branch"})
		return
	}

	c.Status(http.StatusCreated)
}

func (h *employeesHandler) DeleteBranchHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branch ID"})
		return
	}

	if err := h.db.DeleteBranch(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}


// GetAllEmployeesHandler จะดึงข้อมูลพนักงานทั้งหมด
func (h *employeesHandler) GetAllEmployeesHandler(c *gin.Context) {
	// ดึงข้อมูลพนักงานทั้งหมดจาก database
	employees, err := h.db.GetAllEmployees(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลพนักงานทั้งหมดในรูปแบบ JSON
	c.JSON(http.StatusOK, employees)
}

