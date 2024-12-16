package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

func GetStates(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	country := queryParams.Get("country")

	rows, err := db.Query(`
		SELECT DISTINCT s.state_name
		FROM states s
		JOIN items i ON s.state_name = i.state
		WHERE COALESCE(s.country_name, $1) = $1
		ORDER BY state_name ASC;`, country)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching states %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()

	var states []string
	for rows.Next() {
		var state string
		if err := rows.Scan(&state); err != nil {
			fmt.Printf("Error scanning state row: %v", err)
			continue
		}
		states = append(states, state)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(states); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
	}
}
