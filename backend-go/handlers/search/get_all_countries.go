package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

var allCountryCache = struct {
	sync.RWMutex
	Data CacheItem
}{}

func GetAllCountries(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	allCountryCache.RLock()
	cache := allCountryCache.Data
	allCountryCache.RUnlock()

	if cache.ExpiresAt.After(time.Now()) {
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(cache.Data); err != nil {
			http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
		}
		return
	}
	rows, err := db.Query(`
		SELECT country_name
		FROM countries
		ORDER BY country_name ASC;`)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching all countries %v", err), http.StatusInternalServerError)
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

	allCountryCache.Lock()
	allCountryCache.Data = CacheItem{
		Data:      countries,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	cache = allCountryCache.Data
	allCountryCache.Unlock()

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(cache.Data); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode JSON: %v", err), http.StatusInternalServerError)
	}
}
