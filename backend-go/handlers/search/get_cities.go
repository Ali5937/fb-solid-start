package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

func GetCities(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	country := queryParams.Get("country")
	state := queryParams.Get("state")
	city := queryParams.Get("city")

	rows, err := db.Query(`
		WITH RankedCities AS (
				SELECT
					c.city_name,
					c.state_name,
					c.country_name,
					c.ranking
				FROM cities c
				JOIN
					items i ON c.city_name = i.city 
						AND c.state_name = i.state 
						AND c.country_name = i.country 
						AND c.ranking = i.ranking
				WHERE
					c.city_name ILIKE $1
					AND (c.state_name ILIKE $2 OR $2 IS NULL)
					AND (c.country_name ILIKE $3 OR $3 IS NULL)
		),
		DistinctCities AS (
			SELECT DISTINCT
				city_name,
				state_name,
				country_name
			FROM RankedCities
		)
		SELECT 
			city_name,
			state_name,
			country_name
		FROM DistinctCities
		ORDER BY 
			(SELECT MIN(ranking) 
			FROM RankedCities 
			WHERE city_name = DistinctCities.city_name
				AND state_name = DistinctCities.state_name
				AND country_name = DistinctCities.country_name) ASC
		LIMIT 5;`, city, state, country)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting cities from database: %v", err), http.StatusInternalServerError)
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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(cities); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
	}
}
