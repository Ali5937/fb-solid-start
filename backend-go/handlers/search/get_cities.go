package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Ali5937/fb-solid-start/backend-go/models"
	"github.com/Ali5937/fb-solid-start/backend-go/utils"
	"github.com/lib/pq"
)

func GetCities(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	_type := queryParams.Get("type")
	minStr := queryParams.Get("min")
	maxStr := queryParams.Get("max")
	city := queryParams.Get("city")
	state := queryParams.Get("state")
	country := queryParams.Get("country")

	finalType, err := utils.ParseTypeStringArray(_type)
	if err != nil {
		http.Error(w, `{"error": "Type incorrect"}`, http.StatusInternalServerError)
		return
	}

	minVal, err := strconv.Atoi(minStr)
	if err != nil {
		http.Error(w, `{"error": "Error converting string to number"}`, http.StatusInternalServerError)
		return
	}
	var maxVal int = 0
	if maxStr != "" {
		maxVal, err = strconv.Atoi(maxStr)
		if err != nil {
			http.Error(w, `{"error": "Error converting string to number"}`, http.StatusInternalServerError)
			return
		}
	}

	if len(city) < 3 {
		http.Error(w, `{"error": "Error request string too short"}`, http.StatusInternalServerError)
		return
	}

	var params []any = []any{city, state, country, pq.Array(finalType), minVal, maxVal}
	queryText := `
	WITH RankedCities AS (
	  SELECT c.city_name, c.state_name, c.country_name, c.ranking, c.lat, c.lng
	  FROM cities c
	  JOIN items i
      ON c.city_name = i.city
      AND c.state_name = i.state
      AND c.country_name = i.country
      AND c.ranking = i.ranking
      AND i.type = ANY($4)
      AND i.euro_price >= $5
      AND ($6 = 0 OR i.euro_price <= $6)
	  WHERE c.city_name ILIKE $1 || '%'
	    AND (c.state_name = COALESCE(NULLIF($2, ''), c.state_name))
	    AND (c.country_name = COALESCE(NULLIF($3, ''), c.country_name))
	  ),
  DistinctCities AS (
    SELECT DISTINCT city_name, state_name, country_name, lat, lng
    FROM RankedCities
  )
  SELECT city_name, state_name, country_name, lat, lng
  FROM DistinctCities
  ORDER BY (
    SELECT MIN(ranking)
    FROM RankedCities
    WHERE city_name = DistinctCities.city_name
      AND state_name = DistinctCities.state_name
      AND country_name = DistinctCities.country_name
  ) ASC
  LIMIT 5;`

	rows, err := db.Query(queryText, params...)
	if err != nil {
		http.Error(w, `{"error": "Error getting cities from database:"}`, http.StatusInternalServerError)
		return
	}

	var cities []models.GetCity
	for rows.Next() {
		var city models.GetCity
		if err := rows.Scan(&city.City, &city.State, &city.Country, &city.Lat, &city.Lng); err != nil {
			fmt.Printf("Error scanning city row: %v\n", err)
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
