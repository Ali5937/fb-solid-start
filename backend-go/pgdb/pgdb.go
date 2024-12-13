package pgdb

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
)

func InitDB() (*sql.DB, error) {
	db, err := sql.Open(config.Postgres, config.ConnStr)
	if err != nil {
		return nil, fmt.Errorf("opening database connection: %v", err)
	}

	db.SetMaxIdleConns(10)
	db.SetMaxOpenConns(100)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("connecting to the database: %v", err)
	}

	return db, nil
}
