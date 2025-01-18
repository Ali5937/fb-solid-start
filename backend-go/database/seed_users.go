package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Ali5937/fb-solid-start/backend-go/auth"
	"github.com/Ali5937/fb-solid-start/backend-go/config"
)

var emailPasswordPairs = [][2]string{
	{"101@mail.com", "password201"},
	{"102@mail.com", "password202"},
	{"103@mail.com", "password203"},
	{"104@mail.com", "password204"},
	{"105@mail.com", "password205"},
	{"106@mail.com", "password206"},
	{"107@mail.com", "password207"},
	{"108@mail.com", "password208"},
	{"109@mail.com", "password209"},
	{"110@mail.com", "password210"},
}

func seedUsers() {
	db, err := sql.Open(config.Postgres, config.ConnStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	for _, pair := range emailPasswordPairs {
		email := pair[0]
		password := pair[1]

		hash, err := auth.GenerateHashFromPassword(password)
		if err != nil {
			log.Fatalf("Error hashing password: %v", err)
		}

		_, err = db.Exec(`INSERT INTO "users" ("email", "password_hash") VALUES ($1, $2)`, email, hash)
		if err != nil {
			log.Fatalf("Error inserting user into database: %v", err)
		}
	}

	fmt.Printf("Users seeded successfully")
}
