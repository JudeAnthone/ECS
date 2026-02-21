package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/router"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
)

func main() {
	// Initialize configuration
	if err := config.Init(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}
	log.Println("✓ Configuration loaded successfully")

	// Initialize database connection
	if err := database.InitPostgres(config.AppConfig); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Create HTTP server
	server := router.NewServer(config.AppConfig.Server.Port)

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 Server starting on http://%s:%s", config.AppConfig.Server.Host, config.AppConfig.Server.Port)
		log.Printf("📍 Health check available at http://%s:%s/health", config.AppConfig.Server.Host, config.AppConfig.Server.Port)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited successfully")
}
