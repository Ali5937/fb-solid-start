package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

func GetAllStates(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	country := queryParams.Get("country")

	rows, err := db.Query(`
		SELECT state_name
		FROM states
		WHERE country_name = $1
		ORDER BY state_name ASC;`, country)
	if err != nil {
		http.Error(w, `{"error": "Error fetching all states"}`, http.StatusInternalServerError)
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

	res := map[string]interface{}{"data": states}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, `{"error": "Failed to encode JSON"}`, http.StatusInternalServerError)
	}
}
