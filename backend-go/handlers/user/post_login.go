package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Ali5937/fb-solid-start/backend-go/auth"
	"github.com/Ali5937/fb-solid-start/backend-go/config"
	"github.com/Ali5937/fb-solid-start/backend-go/models"
	"github.com/Ali5937/fb-solid-start/backend-go/utils"
)

func PostUserLogin(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var req models.PostUser

	if r.Body == nil {
		http.Error(w, utils.GetErrorString("email and password required"), http.StatusBadRequest)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, utils.GetErrorString("request body is invalid"), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if req.Email == "" || req.Password == "" {
		http.Error(w, utils.GetErrorString("email and password required"), http.StatusBadRequest)
		return
	}

	var passwordHash string
	var userId string
	err := db.QueryRow(`
		SELECT id, password_hash FROM users
		WHERE email = $1`, req.Email).Scan(&userId, &passwordHash)
	if err != nil {
		http.Error(w, utils.GetErrorString("user not found"), http.StatusBadRequest)
	}
	isMatch, err := auth.ComparePasswordAndHash(req.Password, passwordHash)
	if err != nil {
		http.Error(w, utils.GetErrorString("unable to decode password"), http.StatusInternalServerError)
	}
	if !isMatch {
		http.Error(w, utils.GetErrorString("wrong password"), http.StatusBadRequest)
	}

	refreshSecret := []byte(config.JWTSecretRefresh)
	refreshToken, err := auth.CreateJWT(refreshSecret, req.Email, true)
	if err != nil {
		http.Error(w, utils.GetErrorString("something went wrong"), http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(`
		UPDATE users SET refresh_token = $1 WHERE email = $2`, refreshToken, req.Email)
	if err != nil {
		http.Error(w, utils.GetErrorString("something went wrong"), http.StatusInternalServerError)
		return
	}

	accessSecret := []byte(config.JWTSecretAccess)
	accessToken, err := auth.CreateJWT(accessSecret, req.Email, false)
	if err != nil {
		http.Error(w, utils.GetErrorString("something went wrong"), http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   31536000, // one year
	})

	response := map[string]interface{}{
		"user_id": userId,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, utils.GetErrorString("unable to encode response"), http.StatusInternalServerError)
	}
}
