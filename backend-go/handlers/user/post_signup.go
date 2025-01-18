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

func PostUserSignup(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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

	emailExists, err := utils.DoesEmailExist(db, req.Email)
	if err != nil {
		http.Error(w, utils.GetErrorString("error checking if email exists "), http.StatusBadRequest)
		return
	}

	if emailExists {
		http.Error(w, utils.GetErrorString("email is already used"), http.StatusBadRequest)
		return
	}

	if !utils.IsEmailValid(req.Email) {
		http.Error(w, utils.GetErrorString("email is invalid"), http.StatusBadRequest)
		return
	}

	if len(req.Password) < config.PasswordMinLength {
		http.Error(w, utils.GetErrorString("password too short"), http.StatusBadRequest)
		return
	}

	if len(req.Password) > config.PasswordMaxLength {
		http.Error(w, utils.GetErrorString("password too long"), http.StatusBadRequest)
		return
	}

	hash, err := auth.GenerateHashFromPassword(req.Password)
	if err != nil {
		http.Error(w, utils.GetErrorString("error hashing password"), http.StatusInternalServerError)
		return
	}

	refreshSecret := []byte(config.JWTSecretRefresh)
	refreshToken, err := auth.CreateJWT(refreshSecret, req.Email, true)
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

	_, err = db.Exec(`
    INSERT INTO users (email, password_hash, refresh_token)
    VALUES ($1, $2, $3)`, req.Email, hash, refreshToken)
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

	w.WriteHeader(http.StatusCreated)
}
