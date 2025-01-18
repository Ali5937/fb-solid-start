package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func GetUserItems(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	fmt.Println("GET ITEMS ROUTE")
}
