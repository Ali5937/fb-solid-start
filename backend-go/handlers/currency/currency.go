package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Ali5937/fb-solid-start/backend-go/utils"
)

func GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	cwd, err := os.Getwd()
	if err != nil {
		http.Error(w, utils.GetErrorString("failed to find directory"), http.StatusInternalServerError)
		return
	}
	path := filepath.Join(cwd, "currencies", "currency_updated.json")

	data, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, utils.GetErrorString("unable to open JSON file"), http.StatusInternalServerError)
		return
	}

	res := map[string]interface{}{"data": json.RawMessage(data)}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		http.Error(w, utils.GetErrorString("failed to write JSON file to response"), http.StatusInternalServerError)
		return
	}
}
