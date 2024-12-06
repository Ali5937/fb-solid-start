package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

var (
	DBUser          string
	DBPassword      string
	DBName          string
	DBHost          string
	SSLMode         string
	Postgres        string
	ConnStr         string
	ConnStrPostgres string
)

func init() {
	workingDir, err1 := os.Getwd()
	if err1 != nil {
		log.Fatalf("Error getting working directory: %v", err1)
	}

	currentDir := filepath.Base(workingDir)
	envPath := ".env"
	if currentDir != "backend-go" {
		envPath = "../.env"
	}

	err := godotenv.Load(envPath)
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	DBUser = os.Getenv("POSTGRESQL_USER")
	DBPassword = os.Getenv("POSTGRESQL_PASSWORD")
	DBName = os.Getenv("POSTGRESQL_DATABASE")
	DBHost = os.Getenv("POSTGRESQL_HOST")
	SSLMode = os.Getenv("POSTGRESQL_SSLMODE")
	Postgres = "postgres"

	if DBUser == "" || DBPassword == "" || DBName == "" || DBHost == "" || SSLMode == "" {
		log.Fatalf("Error missing database environment variable/s")
	}

	ConnStr = fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s", DBUser, DBPassword, DBHost, DBName, SSLMode)
	ConnStrPostgres = fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s", DBUser, DBPassword, DBHost, Postgres, SSLMode)
}
