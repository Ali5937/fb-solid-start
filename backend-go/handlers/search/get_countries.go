package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type CacheItem struct {
	Data      []string
	ExpiresAt time.Time
}

var countryCache = struct {
	sync.RWMutex
	Data CacheItem
}{}

func GetCountries(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	countryCache.RLock()
	cache := countryCache.Data
	countryCache.RUnlock()

	if cache.ExpiresAt.After(time.Now()) {
		res := map[string]interface{}{"data": cache.Data}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(res); err != nil {
			http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
		}
		return
	}

	rows, err := db.Query(`
		SELECT DISTINCT c.country_name
		FROM countries c
		JOIN items i ON c.country_name = i.country
		ORDER BY country_name ASC;`)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching countries %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()

	var countries []string
	for rows.Next() {
		var country string
		if err := rows.Scan(&country); err != nil {
			fmt.Printf("Error scanning country row: %v", err)
			continue
		}
		countries = append(countries, country)
	}

	countryCache.Lock()
	countryCache.Data = CacheItem{
		Data:      countries,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	cache = countryCache.Data
	countryCache.Unlock()

	res := map[string]interface{}{"data": cache.Data}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
	}
}
