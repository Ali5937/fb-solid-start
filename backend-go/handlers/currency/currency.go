package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
)

func GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	cwd, err := os.Getwd()
	if err != nil {
		http.Error(w, `{"error": "Failed to find directory"}`, http.StatusInternalServerError)
	}
	path := filepath.Join(cwd, "currencies", "currency_updated.json")

	data, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, `{"error": "Unable to open JSON file"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	res := map[string]interface{}{"data": json.RawMessage(data)}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		http.Error(w, `{"error": "Failed to write JSON file to response"}`, http.StatusInternalServerError)
		return
	}
}
