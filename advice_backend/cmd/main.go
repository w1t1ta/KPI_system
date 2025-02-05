package main

import (
	"context"
	"log"
	"time"
	"advice_backend/internal/advice"
	"advice_backend/internal/config"
	"advice_backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize the database
	db, err := advice.NewPostgresDatabase(cfg.GetConnectionString())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close() // ปิดการเชื่อมต่อเมื่อฟังก์ชัน main เสร็จสิ้น

	// Initialize the employee handler
	bs := advice.NewEmployee(db) // สมมติว่า NewEmployee ใช้ db เป็น parameter
	h := handlers.NewEmployeesHandler(bs)

	// Goroutine สำหรับตรวจสอบการเชื่อมต่อกับฐานข้อมูล
	go func() {
		for {
			time.Sleep(10 * time.Second)
			if err := db.Ping(); err != nil {
				log.Printf("Database connection lost: %v", err)
				if reconnErr := db.Reconnect(cfg.GetConnectionString()); reconnErr != nil {
					log.Printf("Failed to reconnect: %v", reconnErr)
				} else {
					log.Printf("Successfully reconnected to the database")
				}
			}
		}
	}()

	// Set up Gin router
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Add CORS middleware
	configCors := cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"}, // Modify as per your allowed domains
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(configCors))

	// Apply timeout middleware
	r.Use(TimeoutMiddleware(5 * time.Second))

	// Define routes
	v1 := r.Group("/api/v1")
	{
		// Employees routes
		v1.GET("/employees", h.GetAllEmployeesHandler)
		v1.GET("/get_employees/:id", h.GetEmployeeHandler)
		v1.POST("/add_employees", h.AddEmployeeHandler)
		v1.DELETE("/delete_employees/:id", h.DeleteEmployeeHandler)

		// Roles routes
		v1.GET("/get_roles/:id", h.GetRoleHandler)
		v1.POST("/add_roles", h.AddRoleHandler)
		v1.DELETE("/delete_roles/:id", h.DeleteRoleHandler)

		// Branches routes
		v1.GET("/get_branches/:id", h.GetBranchHandler)
		v1.POST("/add_branches", h.AddBranchHandler)
		v1.DELETE("/delete_branches/:id", h.DeleteBranchHandler)
	}

	// Start the server
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
