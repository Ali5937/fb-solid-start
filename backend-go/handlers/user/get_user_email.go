package handlers

import (
	"database/sql"
	"net/http"

	"github.com/Ali5937/fb-solid-start/backend-go/utils"
)

func GetUserEmail(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	queryParams := r.URL.Query()
	email := queryParams.Get("email")

	exists, err := utils.DoesEmailExist(db, email)
	if err != nil {
		http.Error(w, utils.GetErrorString("something went wrong"), http.StatusInternalServerError)
	}

	if exists {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}
