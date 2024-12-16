package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

func GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	cwd, _ := os.Getwd()
	path := filepath.Join(cwd, "currencies", "currency-updated.json")

	file, err := os.Open(path)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to open JSON file: %v", err), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Type", "application/json")

	_, err = file.WriteTo(w)
	if err != nil {
		http.Error(w, "Failed to write JSON file to response", http.StatusInternalServerError)
		return
	}
}
