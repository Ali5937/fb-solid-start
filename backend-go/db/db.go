package db

import (
	"database/sql"
	"fmt"
	"os"
	"time"
)

func InitDB() (*sql.DB, error) {
	dbUser := os.Getenv("POSTGRESQL_USER")
	dbPassword := os.Getenv("POSTGRESQL_PASSWORD")
	dbName := os.Getenv("POSTGRESQL_DATABASE")
	dbHost := os.Getenv("POSTGRESQL_HOST")
	sslMode := os.Getenv("POSTGRESQL_SSLMODE")
	fmt.Println(dbUser, dbName, dbHost)

	if dbUser == "" || dbPassword == "" || dbName == "" || dbHost == "" {
		return nil, fmt.Errorf("missing one or more database environment variables")
	}

	connStr := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s", dbUser, dbPassword, dbHost, dbName, sslMode)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	db.SetMaxIdleConns(10)
	db.SetMaxOpenConns(100)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	return db, nil
}
