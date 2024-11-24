package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func GetItemsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	queryParams := r.URL.Query()

	itemType := queryParams.Get("type")
	min := queryParams.Get("min")
	max := queryParams.Get("max")
	polygon := queryParams.Get("polygon")
	polygon2 := queryParams.Get("polygon2")
	itemSort := queryParams.Get("itemSort")
	country := queryParams.Get("country")
	state := queryParams.Get("state")
	city := queryParams.Get("city")

	fmt.Printf("type: %s\n", itemType)
	fmt.Printf("min: %s\n", min)
	fmt.Printf("max: %s\n", max)
	fmt.Printf("polygon: %s\n", polygon)
	fmt.Printf("polygon2: %s\n", polygon2)
	fmt.Printf("itemSort: %s\n", itemSort)
	fmt.Printf("country: %s\n", country)
	fmt.Printf("state: %s\n", state)
	fmt.Printf("city: %s\n", city)

}
