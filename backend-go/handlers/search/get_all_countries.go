package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/Ali5937/fb-solid-start/backend-go/utils"
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
		res := map[string]interface{}{"data": cache.Data}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(res); err != nil {
			http.Error(w, utils.GetErrorString("failed to encode JSON"), http.StatusInternalServerError)
		}
		return
	}
	rows, err := db.Query(`
		SELECT country_name
		FROM countries
		ORDER BY country_name ASC;`)
	if err != nil {
		http.Error(w, utils.GetErrorString("error fetching all countries"), http.StatusInternalServerError)
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

	res := map[string]interface{}{"data": cache.Data}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(res); err != nil {
		http.Error(w, utils.GetErrorString("failed to encode JSON"), http.StatusInternalServerError)
	}
}
