package advice

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// เปลี่ยนชื่อ struct ให้เป็น Employee
type Employee struct {
	EmID     int    `json:"em_id"`
	EmName   string `json:"em_name"`
	EmAge    int    `json:"em_age"`
	EmPhone  string `json:"em_phone"`
	EmEmail  string `json:"em_email"`
	BranchID int    `json:"branch_id"`
	RoleID   int    `json:"role_id"` // เปลี่ยนเป็น int
}

type Role struct {
	RoleID   int    `json:"role_id"`
	RoleName string `json:"role_name"`
}

type Branch struct {
	BranchID       int    `json:"branch_id"`
	BranchName     string `json:"branch_name"`
	BranchDistrict string `json:"branch_district"`
	BranchCountry  string `json:"branch_country"`
}

type Employee_details struct {
    Em_ID           int    `json:"em_id"`
    Em_Name         string `json:"em_name"`
    Em_Age          int    `json:"em_age"`
    Em_Phone        string `json:"em_phone"`
    Em_Email        string `json:"em_email"`
    Branch_ID       int    `json:"branch_id"`    // เพิ่มฟิลด์นี้
    Branch_Name     string `json:"branch_name"`
    Branch_District string `json:"branch_district"`
    Branch_Country  string `json:"branch_country"`
    Role_ID         int    `json:"role_id"`      // เพิ่มฟิลด์นี้
    Role_Name       string `json:"role_name"`
}


type EmployeesDatabase interface {
	//Employees
	GetAllEmployees(ctx context.Context) ([]Employee_details, error)
	GetEmployee(ctx context.Context, id int) (Employee_details, error) // เปลี่ยนชื่อ method เป็น GetEmployee
	AddEmployee(ctx context.Context, id int, name string, age int, phone string, email string, br_id int, r_id int) error
	DeleteEmployee(ctx context.Context, id int) error
	//Role
	GetRole(ctx context.Context, id int) (Role, error)
	AddRole(ctx context.Context, id int, name string) error
	DeleteRole(ctx context.Context, id int) error
	//Branch
	GetBranch(ctx context.Context, id int) (Branch, error)
	DeleteBranch(ctx context.Context, id int) error
	AddBranch(ctx context.Context, id int, name string, district string, country string) error
	// recommend
	Close() error
	Ping() error
	Reconnect(connStr string) error
}

type PostgresDatabase struct {
	db *sql.DB
}

func NewPostgresDatabase(connStr string) (*PostgresDatabase, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	return &PostgresDatabase{db: db}, nil
}

// recommend

func (pdb *PostgresDatabase) Close() error {
	return pdb.db.Close()
}

func (pdb *PostgresDatabase) Ping() error {
	if pdb == nil {
		return errors.New("database connection is not initialized")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return pdb.db.PingContext(ctx)
}

func (pdb *PostgresDatabase) Reconnect(connStr string) error {
	if pdb.db != nil {
		pdb.db.Close()
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	pdb.db = db
	return nil
}

// employees

func (pdb *PostgresDatabase) GetAllEmployees(ctx context.Context) ([]Employee_details, error) {
	// สร้าง slice สำหรับเก็บพนักงานทั้งหมด
	var employees []Employee_details

	// คำสั่ง SQL เพื่อดึงข้อมูลพนักงานทั้งหมด
	query := `
		SELECT e.em_id, e.em_name, e.em_age, e.em_phone, e.em_email, 
		       b.branch_id, b.branch_name, b.branch_district, b.branch_country, 
		       r.role_id, r.role_name 
		FROM employees e 
		JOIN branch b ON e.branch_id = b.branch_id 
		JOIN roles r ON r.role_id = e.role_id;
	`

	// รันคำสั่ง SQL
	rows, err := pdb.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query employees: %v", err)
	}
	defer rows.Close()

	// อ่านข้อมูลจาก result set
	for rows.Next() {
		var employee Employee_details
		err := rows.Scan(
			&employee.Em_ID,
			&employee.Em_Name,
			&employee.Em_Age,
			&employee.Em_Phone,
			&employee.Em_Email,
			&employee.Branch_ID,
			&employee.Branch_Name,
			&employee.Branch_District,
			&employee.Branch_Country,
			&employee.Role_ID,
			&employee.Role_Name,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan employee: %v", err)
		}

		// เพิ่มพนักงานลงใน slice
		employees = append(employees, employee)
	}

	// ตรวจสอบว่ามี error เกิดขึ้นระหว่างการอ่านข้อมูลหรือไม่
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %v", err)
	}

	// ส่งข้อมูลพนักงานทั้งหมดกลับ
	return employees, nil
}


func (pdb *PostgresDatabase) GetEmployee(ctx context.Context, id int) (Employee_details, error) {
	var Employee Employee_details
	query := `
		SELECT e.em_id, e.em_name, e.em_age, e.em_phone, e.em_email, 
       b.branch_id, b.branch_name, b.branch_district, b.branch_country, 
       r.role_id, r.role_name 
       FROM employees e 
       JOIN branch b ON e.branch_id = b.branch_id 
       JOIN roles r ON r.role_id = e.role_id 
       WHERE e.em_id = $1;
	`

	err := pdb.db.QueryRowContext(ctx, query, id).Scan(
		&Employee.Em_ID,
		&Employee.Em_Name,
		&Employee.Em_Age,
		&Employee.Em_Phone,
		&Employee.Em_Email,
		&Employee.Branch_ID,       // เพิ่มการดึงข้อมูล branch_id
		&Employee.Branch_Name,
		&Employee.Branch_District,
		&Employee.Branch_Country,
		&Employee.Role_ID,         // เพิ่มการดึงข้อมูล role_id
		&Employee.Role_Name,
	)
	
	

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Employee_details{}, fmt.Errorf("employee with id %d not found", id)
		}
		return Employee_details{}, err
	}
	return Employee, nil
}

func (pdb *PostgresDatabase) AddEmployee(ctx context.Context, id int, name string, age int, phone string, email string, br_id int, r_id int) error {
	query := `
		INSERT INTO employees (em_id, em_name, em_age, em_phone, em_email, branch_id, role_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7);
	`

	_, err := pdb.db.ExecContext(ctx, query, id, name, age, phone, email, br_id, r_id)
	if err != nil {
		return fmt.Errorf("failed to add employee: %v", err)
	}
	return nil
}

func (pbd *PostgresDatabase) DeleteEmployee(ctx context.Context, id int) error {
	result, err := pbd.db.ExecContext(ctx, "DELETE FROM employees WHERE em_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete employees: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employees not found")
	}
	return nil
}

// Role

func (pdb *PostgresDatabase) GetRole(ctx context.Context, id int) (Role, error) {
	var role Role
	query := "SELECT role_id, role_name FROM roles WHERE role_id = $1"
	err := pdb.db.QueryRowContext(ctx, query, id).Scan(&role.RoleID, &role.RoleName)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Role{}, fmt.Errorf("role with id %d not found", id)
		}
		return Role{}, fmt.Errorf("failed to get role: %v", err)
	}
	return role, nil
}

func (pdb *PostgresDatabase) AddRole(ctx context.Context, id int, name string) error {
	_, err := pdb.db.ExecContext(ctx, "insert into roles values ($1,$2);", id, name)
	if err != nil {
		return fmt.Errorf("failed to add Role: %v", err)
	}
	return nil
}

func (pdb *PostgresDatabase) DeleteRole(ctx context.Context, id int) error {
	result, err := pdb.db.ExecContext(ctx, "DELETE FROM roles WHERE role_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete Role: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("Role not found")
	}
	return nil
}

// branch
func (pdb *PostgresDatabase) GetBranch(ctx context.Context, id int) (Branch, error) {
	var branch Branch
	query := "SELECT branch_id, branch_name, branch_district, branch_country FROM branch WHERE branch_id = $1"
	err := pdb.db.QueryRowContext(ctx, query, id).Scan(
		&branch.BranchID,
		&branch.BranchName,
		&branch.BranchDistrict,
		&branch.BranchCountry,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Branch{}, fmt.Errorf("branch with id %d not found", id)
		}
		return Branch{}, fmt.Errorf("failed to get branch: %v", err)
	}
	return branch, nil
}
func (pdb *PostgresDatabase) AddBranch(ctx context.Context, id int, name string, district string, country string) error {
	query := `
		INSERT INTO branch (branch_id,branch_name, branch_district, branch_country)
		VALUES ($1, $2, $3,$4);
	`

	_, err := pdb.db.ExecContext(ctx, query, id, name, district, country)
	if err != nil {
		return fmt.Errorf("failed to add branch: %v", err)
	}
	return nil
}
func (pdb *PostgresDatabase) DeleteBranch(ctx context.Context, id int) error {
	query := "DELETE FROM branch WHERE branch_id = $1"

	result, err := pdb.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete branch: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("branch with id %d not found", id)
	}

	return nil
}

// ดึงเอา function มาใช้

type employees struct {
	db EmployeesDatabase
}

// NewEmployee
func NewEmployee(db EmployeesDatabase) *employees {
	return &employees{db: db}
}

// ดึงเอา Employees
func (bs *employees) GetAllEmployees(ctx context.Context) ([]Employee_details, error) {
	return bs.db.GetAllEmployees(ctx)
}
func (bs *employees) GetEmployee(ctx context.Context, id int) (Employee_details, error) {
	return bs.db.GetEmployee(ctx, id)
}

func (bs *employees) AddEmployee(ctx context.Context, id int, name string, age int, phone string, email string, br_id int, r_id int) error {
	return bs.db.AddEmployee(ctx, id, name, age, phone, email, br_id, r_id)
}

func (bs *employees) DeleteEmployee(ctx context.Context, id int) error {
	return bs.db.DeleteEmployee(ctx, id)
}

// ดึงเอา Role
func (bs *employees) GetRole(ctx context.Context, id int) (Role, error) {
	return bs.db.GetRole(ctx, id)
}
func (bs *employees) DeleteRole(ctx context.Context, id int) error {
	return bs.db.DeleteRole(ctx, id)
}

func (bs *employees) AddRole(ctx context.Context, id int, name string) error {
	return bs.db.AddRole(ctx, id, name)
}

// ดึงเอา Branch
func (bs *employees) GetBranch(ctx context.Context, id int) (Branch, error) {
	return bs.db.GetBranch(ctx, id)
}

func (bs *employees) DeleteBranch(ctx context.Context, id int) error {
	return bs.db.DeleteBranch(ctx, id)
}

func (bs *employees) AddBranch(ctx context.Context, id int, name string, district string, country string) error {
	return bs.db.AddBranch(ctx, id, name, district, country)
}

// recommend
func (bs *employees) Close() error {
	return bs.db.Close()
}

func (bs *employees) Ping() error {
	if bs.db == nil {
		return fmt.Errorf("database connection is not initialized")
	}
	return bs.db.Ping()
}

func (bs *employees) Reconnect(connStr string) error {
	return bs.db.Reconnect(connStr)
}
