package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func CreateJWT(secret []byte, email string, isRefreshToken bool) (string, error) {
	expirationTime := time.Now().Add(time.Minute * 15).Unix() // Token expires in 15 minutes
	if isRefreshToken {
		expirationTime = time.Now().Add(time.Hour * 24 * 7).Unix() // Token expires in one week
	}
	fmt.Println(expirationTime)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp":   expirationTime,
	})

	tokenString, err := token.SignedString(secret)
	if err != nil {
		return "", fmt.Errorf("creating JWT: %v", err)
	}

	return tokenString, nil
}
