package utils

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/mail"
	"strings"
)

func ParseItemType(str string) ([]int, error) {
	var numArr []int
	for i, s := range strings.Split(str, ",") {
		if i > 3 {
			return nil, fmt.Errorf("more than 3 numbers as type")
		}
		var num int
		_, err := fmt.Sscanf(s, "%d", &num)
		if err != nil {
			return nil, fmt.Errorf("scanning number: %v", err)
		}
		if num <= 18 {
			numArr = append(numArr, num)
		} else {
			return nil, fmt.Errorf("number too large to be type")
		}

		if len(numArr) == 0 {
			return nil, fmt.Errorf("no number")
		}
	}
	return numArr, nil
}

func GetErrorString(errString string) string {
	errorMap := map[string]string{"error": errString}
	jsonData, err := json.Marshal(errorMap)
	if err != nil {
		log.Println("Error marshaling JSON:", err)
		return `{"error": "internal server error"}`
	}
	return string(jsonData)
}

func DoesEmailExist(db *sql.DB, email string) (bool, error) {
	var exists bool
	err := db.QueryRow(`
    SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("checking if email exists in database")
	}
	return exists, nil
}

func IsEmailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
