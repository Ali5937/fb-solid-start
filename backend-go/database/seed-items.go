package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"log"
	"math"
	"math/rand"
	"os"

	"github.com/Ali5937/fb-solid-start/backend-go/models"
	"github.com/Ali5937/fb-solid-start/backend-go/pgdb"
	"github.com/lib/pq"
)

func seedItems() {
	start := time.Now()
	currenciesData, keys := loadCurrencyData()
	db, err := pgdb.InitDB()
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("DELETE FROM items")
	if err != nil {
		log.Fatalf("Error deleting all rows from items table: %v", err)
	}

	var cityCount int
	err = db.QueryRow(`SELECT COUNT(*) FROM cities`).Scan(&cityCount)
	if err != nil {
		log.Fatalf("Error fetching row count of cities table: %v", err)
	}

	queryCitiesText := `
	SELECT *
	FROM cities
	LIMIT $1 OFFSET $2;`
	const offset = 100
	var currentOffset int = 0
	loopCount := cityCount / offset

	userIds := getUserIds(db)

	for i := 0; i <= loopCount; i++ {
		rows, err := db.Query(queryCitiesText, offset, currentOffset)
		if err != nil {
			log.Fatalf("Error fetching cities: %v", err)
		}
		defer rows.Close()
		currentOffset += offset
		userId := userIds[rand.Intn(len(userIds))]
		var pictures []int16
		for i := 0; i < 20; i++ {
			pic := int16(rand.Int31n(1000))
			pictures = append(pictures, pic)
		}

		var currentCity models.City
		for rows.Next() {
			err := rows.Scan(
				&currentCity.ID, &currentCity.City, &currentCity.State,
				&currentCity.Country, &currentCity.Ranking, &currentCity.Lat, &currentCity.Lng)
			if err != nil {
				log.Fatalf("Error reading row from rows in cities: %v", err)
			}
			insertItem(db, currenciesData, keys, currentCity, userId, pictures)
		}
		percentage := math.Round((float64(i)/float64(loopCount)*100)*100) / 100
		fmt.Printf("\r%v%%", percentage)
	}
	elapsed := time.Since(start).Milliseconds()
	fmt.Printf("\nTime taken seeding items: %vms", elapsed) //~62min-75min
}

func insertItem(db *sql.DB, currData map[string]models.Currency, ks []string, currentCity models.City,
	userId string, pictures []int16) {
	item := models.PostItem{}
	//1RentApartment, 2RentHouse, 3RentShared, 4BuyApartment, 5BuyHouse, 6BuyLand
	universalType := int16(rand.Int31n(6) + 1)

	var euroPrice int32
	if universalType <= 3 { //rent
		euroPrice = (rand.Int31n(2000) + 100)
		item.Floor = new(int16)
		*item.Floor = int16(rand.Int31n(10) - 1)
		item.UtilityCost = new(int16)
		*item.UtilityCost = int16(rand.Int31n(300))
		item.Deposit = new(int16)
		*item.Deposit = int16(rand.Int31n(euroPrice * (rand.Int31n(4) + 1)))
		item.CouncilHome = new(bool)
		*item.CouncilHome = rand.Int31n(2) == 0
		item.Plot = nil
		item.Floors = nil
	} else { //buy
		euroPrice = rand.Int31n(1000000) + 10000
		item.Plot = new(int32)
		*item.Plot = rand.Int31n(3000) + 100
		item.Floors = new(int16)
		*item.Floors = int16(rand.Int31n(3) + 1)
		item.Floor = nil
		item.UtilityCost = nil
		item.Deposit = nil
		item.CouncilHome = nil
	}

	randomCurrency := getRandomCurrency(currData, ks)
	originalPrice := math.Round(float64(euroPrice) * randomCurrency.ExchangeRate)

	item.EuroPrice = int32(euroPrice)
	item.OriginalPrice = int64(originalPrice)

	item.FirstPicture = int16(1)

	item.Type = universalType
	if item.Lng >= -32 && item.Lng < 62 {
		item.Type += 6
	} else if item.Lng > 62 {
		item.Type += 12
	}

	item.Size = int16(rand.Int31n(20000))
	item.Bed = int16(rand.Int31n(3) + 1)
	item.Bath = int16(rand.Int31n(2) + 1)
	item.LikeCount = int16(rand.Int31n(100))

	item.CurrencyCode = randomCurrency.Code
	item.CurrencyName = randomCurrency.Name
	item.CurrencySymbol = randomCurrency.Symbol
	item.FirmBoost = new(int16)
	*item.FirmBoost = 1
	item.PetsAllowed = new(bool)
	*item.PetsAllowed = rand.Int31n(2) == 0
	item.Ranking = currentCity.Ranking

	item.Country = currentCity.Country
	item.State = currentCity.State
	item.City = currentCity.City
	coordinates := fmt.Sprintf("SRID=4326;POINT(%v %v)", currentCity.Lng, currentCity.Lat)
	item.Heating = new(int16)
	*item.Heating = int16(rand.Int31n(6))
	item.IsDeleted = false
	item.Cooling = new(bool)
	*item.Cooling = rand.Int31n(2) == 0
	item.Elevator = new(bool)
	*item.Elevator = rand.Int31n(2) == 0
	item.Garden = new(bool)
	*item.Garden = rand.Int31n(2) == 0
	item.SwimmingPool = new(bool)
	*item.SwimmingPool = rand.Int31n(2) == 0
	item.Parking = new(bool)
	*item.Parking = rand.Int31n(2) == 0
	var isAuction = rand.Int31n(10) == 0
	if isAuction {
		item.AuctionDate = new(time.Time)
		*item.AuctionDate = time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(),
			0, 0, 0, 0, time.UTC)
	} else {
		item.AuctionDate = nil
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Error with transaction seeding items: %v", err)
	}
	defer tx.Rollback()

	queryText := `
  INSERT INTO items (user_id, original_price, euro_price, first_picture, type, size, plot, bed, bath, 
	like_count, firm_boost, pets_allowed, ranking, coordinates, city, state, country, currency_name, 
	currency_symbol, currency_code, floor, floors, heating, utility_cost, deposit, 
	is_deleted, cooling, elevator, garden, swimming_pool, parking, council_home, auction_date, firm_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_GeogFromText($14), $15, $16, $17,
	$18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
	RETURNING id`

	err = tx.QueryRow(queryText, userId, item.OriginalPrice, item.EuroPrice, item.FirstPicture, item.Type, item.Size,
		item.Plot, item.Bed, item.Bath,
		item.LikeCount, item.FirmBoost, item.PetsAllowed,
		item.Ranking, coordinates, item.City, item.State, item.Country, item.CurrencyName, item.CurrencySymbol,
		item.CurrencyCode, item.Floor, item.Floors,
		item.Heating, item.UtilityCost, item.Deposit,
		item.IsDeleted, item.Cooling, item.Elevator, item.Garden, item.SwimmingPool, item.Parking,
		item.CouncilHome, item.AuctionDate, item.FirmID).Scan(&item.Id)
	if err != nil {
		log.Fatalf("Error seeding items into db: %v", err)
	}

	tx.Exec(`
	INSERT INTO item_pictures (item_id, item_type, pictures)
	VALUES ($1, $2, $3)`, item.Id, item.Type, pq.Array(pictures))

	if err = tx.Commit(); err != nil {
		log.Fatalf("Error commiting transaction seeding items: %v", err)
	}

}

func loadCurrencyData() (map[string]models.Currency, []string) {
	file, err := os.Open("../currencies/currency-updated.json")
	if err != nil {
		log.Fatalf("Error opening currency-template.json: %v", err)
	}

	var currenciesData map[string]models.Currency
	var keys []string
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&currenciesData)
	if err != nil {
		log.Fatalf("Error decoding JSON: %v", err)
	}

	keys = make([]string, 0, len(currenciesData))
	for key := range currenciesData {
		keys = append(keys, key)
	}

	return currenciesData, keys
}

func getRandomCurrency(currData map[string]models.Currency, ks []string) models.Currency {
	randomKey := rand.Int63n(int64(len(ks)))
	randomCurr := currData[ks[randomKey]]
	return randomCurr
}

func getUserIds(db *sql.DB) []string {
	var ids []string
	rows, err := db.Query(`
	SELECT id FROM users
	LIMIT 10`)
	if err != nil {
		log.Fatalf("Error fetching users: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		err = rows.Scan(&id)
		if err != nil {
			log.Fatalf("Error getting id from user: %v", err)
		}
		ids = append(ids, id)
	}
	return ids
}
