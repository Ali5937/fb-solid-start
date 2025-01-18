package handlers

import (
	"database/sql"
	"net/http"

	mWare "github.com/Ali5937/fb-solid-start/backend-go/middleware"
	"github.com/Ali5937/fb-solid-start/backend-go/utils"
)

func PostUserLogout(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	email := r.Context().Value(mWare.EmailContextKey).(string)
	if email == "" {
		http.Error(w, utils.GetErrorString("email not found in context"), http.StatusUnauthorized)
		return
	}

	_, err := db.Exec(`
		UPDATE users SET refresh_token = $1 WHERE email = $2`, nil, email)
	if err != nil {
		http.Error(w, utils.GetErrorString("something went wrong"), http.StatusInternalServerError)
		return
	}
}
