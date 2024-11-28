package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/lib/pq"
)

func GetItemsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	start := time.Now()

	queryParams := r.URL.Query()
	_type := queryParams.Get("type")
	min := queryParams.Get("min")
	max := queryParams.Get("max")
	polygon := queryParams.Get("polygon")
	polygon2 := queryParams.Get("polygon2")
	itemSort := queryParams.Get("itemSort")
	country := queryParams.Get("country")
	state := queryParams.Get("state")
	city := queryParams.Get("city")

	type Item struct {
		Lat            float64 `json:"lat"`
		Lng            float64 `json:"lng"`
		Type           int16   `json:"type"`
		EuroPrice      int64   `json:"euro_price"`
		CreatedAt      string  `json:"created_at"`
		OriginalPrice  int64   `json:"original_price"`
		Size           int16   `json:"size"`
		CurrencyCode   string  `json:"currency_code"`
		CurrencyName   string  `json:"currency_name"`
		CurrencySymbol string  `json:"currency_symbol"`
		FirstPicture   int64   `json:"first_picture"`
		Id             int64   `json:"id"`
		City           string  `json:"city"`
		State          string  `json:"state"`
		Country        string  `json:"country"`
	}

	finalPolygon := getFinalPolygon(polygon, polygon2)
	var finalType []int = parseStringArray(_type)

	var args []interface{}
	var sqlParamCount int = 0

	var queryText = `
		SELECT ST_Y(ST_TRANSFORM(coordinates::geometry, 4326)) AS lat,
		ST_X(ST_TRANSFORM(coordinates::geometry, 4326)) AS lng,
		type, euro_price, created_at, original_price,
		size, currency_code, currency_name, currency_symbol, first_picture, id, city, state, country
		FROM items
		WHERE`

	if finalPolygon != "" {
		sqlParamCount++
		queryText += fmt.Sprintf(" ST_Covers(ST_GeomFromText($%d, 4326)::geography, coordinates)", sqlParamCount)
		args = append(args, finalPolygon)
	}

	if len(finalType) > 0 {
		sqlParamCount++
		andToAdd := ""
		if sqlParamCount == 2 {
			andToAdd = " AND"
		}
		queryText += fmt.Sprintf("%s type = ANY($%d)", andToAdd, sqlParamCount)
		args = append(args, pq.Array(finalType))
	}

	minVal, minErr := strconv.Atoi(min)
	if minErr != nil {
		return
	}
	sqlParamCount++
	queryText += fmt.Sprintf(" AND euro_price >= $%d", sqlParamCount)
	args = append(args, minVal)

	if max != "" {
		if maxVal, maxErr := strconv.Atoi(max); maxErr == nil {
			sqlParamCount++
			queryText += fmt.Sprintf(" AND euro_price <= $%d", sqlParamCount)
			args = append(args, maxVal)
		}
	}

	if country != "" {
		sqlParamCount++
		queryText += fmt.Sprintf(" AND country = $%d", sqlParamCount)
		args = append(args, country)
	}

	if state != "" {
		sqlParamCount++
		queryText += fmt.Sprintf(" AND state = $%d", sqlParamCount)
		args = append(args, state)
	}

	if city != "" {
		sqlParamCount++
		queryText += fmt.Sprintf(" AND city = $%d", sqlParamCount)
		args = append(args, city)
	}

	var orderString = " ORDER BY euro_price ASC" //itemsort == low

	if itemSort == "new" {
		orderString = " ORDER BY created_at DESC"
	} else if itemSort == "high" {
		orderString = " ORDER BY euro_price DESC"
	}

	queryText += orderString

	queryText += " LIMIT 500;"

	rows, err := db.Query(queryText, args...)

	if err != nil {
		fmt.Printf("error fetching /items\n%v", err)
		return
	}
	defer rows.Close()

	var items []Item

	for rows.Next() {
		var item Item

		err := rows.Scan(&item.Lat, &item.Lng, &item.Type, &item.EuroPrice, &item.CreatedAt, &item.OriginalPrice,
			&item.Size, &item.CurrencyCode, &item.CurrencyName, &item.CurrencySymbol, &item.FirstPicture,
			&item.Id, &item.City, &item.State, &item.Country)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err)
			continue
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating rows", http.StatusInternalServerError)
		log.Println("Rows iteration error: ", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(items); err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		log.Println("JSON encoding error:", err)
	}

	elapsed := time.Since(start).Milliseconds()
	fmt.Printf("/items: %vms\n", elapsed)
}

func getFinalPolygon(poly string, poly2 string) string {
	if poly == "" {
		return ""
	}

	if poly2 == "" {
		return fmt.Sprintf("POLYGON((%s))", polyToString(poly))
	} else {
		return fmt.Sprintf("MULTIPOLYGON((%s), (%s))", polyToString(poly), polyToString(poly2))
	}
}

func polyToString(poly string) string {
	polygonPairs := strings.Split(poly, ",")
	var formattedPairs []string
	for _, pairString := range polygonPairs {
		pair := strings.Split(pairString, "_")
		if len(pair) == 2 {
			formattedPairs = append(formattedPairs, fmt.Sprintf("%s %s", pair[0], pair[1]))
		}
	}
	return strings.Join(formattedPairs, ", ")
}

func parseStringArray(str string) []int {
	var numArr []int
	for _, s := range strings.Split(str, ",") {
		var num int
		if _, err := fmt.Sscanf(s, "%d", &num); err == nil {
			if num <= 18 {
				numArr = append(numArr, num)
			}
		}
	}
	return numArr
}
