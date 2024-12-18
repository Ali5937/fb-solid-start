package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
)

func GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	cwd, _ := os.Getwd()
	path := filepath.Join(cwd, "currencies", "currency-updated.json")

	data, err := ioutil.ReadFile(path)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to open JSON file: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	res := map[string]interface{}{"data": json.RawMessage(data)}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to write JSON file to response: %v", err), http.StatusInternalServerError)
		return
	}
}
