package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
	"github.com/Ali5937/fb-solid-start/backend-go/utils"
	"github.com/golang-jwt/jwt"
)

type contextKey string

const EmailContextKey contextKey = "email"

func ValidateAccessToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		fmt.Printf("COOKIE: %v\n", cookie)
		if err != nil {
			http.Error(w, utils.GetErrorString("access token not found"), http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value
		accessSecret := []byte(config.JWTSecretAccess)

		claims, err := ValidateJWT(tokenString, accessSecret)
		if err != nil {
			http.Error(w, utils.GetErrorString("invalid access token"), http.StatusUnauthorized)
			return
		}
		email, ok := claims["email"].(string)
		if !ok {
			http.Error(w, utils.GetErrorString("invalid access token claims"), http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), EmailContextKey, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ValidateJWT(tokenString string, secret []byte) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}
