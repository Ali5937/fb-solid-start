package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
	_ "github.com/lib/pq"
)

func createDatabase() {
	db, err := sql.Open(config.Postgres, config.ConnStrPostgres)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Unable to reach the database: %v", err)
	}

	dropQuery := fmt.Sprintf(`DROP DATABASE IF EXISTS %s WITH (FORCE)`, config.DBName)
	_, err = db.Exec(dropQuery)
	if err != nil {
		log.Fatalf("Error dropping database: %v", err)
	}

	createQuery := fmt.Sprintf(`CREATE DATABASE %s`, config.DBName)
	_, err = db.Exec(createQuery)
	if err != nil {
		log.Fatalf("Error creating database: %v", err)
	}

	log.Printf("Database %s created successfully", config.DBName)
}
