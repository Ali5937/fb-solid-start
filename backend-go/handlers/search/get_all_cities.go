package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

func GetAllCities(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	country := queryParams.Get("country")
	state := queryParams.Get("state")
	city := queryParams.Get("city")

	rows, err := db.Query(`
		WITH RankedCities AS (
			SELECT
				city_name,
				state_name,
				country_name,
				ranking,
				lat,
				lng
			FROM cities
			WHERE
				city_name ILIKE $1
				AND (state_name ILIKE $2 OR $2 IS NULL)
				AND (country_name ILIKE $3 OR $3 IS NULL)
		)
		SELECT 
			city_name,
			state_name,
			country_name,
			lat,
			lng
		FROM RankedCities
		ORDER BY ranking ASC
		LIMIT 5;`, city, state, country)
	if err != nil {
		http.Error(w, `{"error": "Error getting cities from database"}`, http.StatusInternalServerError)
		return
	}

	var cities []string
	for rows.Next() {
		var city string
		if err := rows.Scan(&city); err != nil {
			fmt.Printf("Error scanning city row: %v", err)
			continue
		}
		cities = append(cities, city)
	}

	res := map[string]interface{}{"data": cities}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, `{"error": "Failed to encode JSON"}`, http.StatusInternalServerError)
	}
}
