package main

import (
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"os"
	"strconv"
	"time"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
	"github.com/Ali5937/fb-solid-start/backend-go/models"
)

func createGisTables() {
	startTime := time.Now()
	db, err := sql.Open(config.Postgres, config.ConnStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE extension IF NOT EXISTS pg_trgm")
	if err != nil {
		log.Fatalf("Error creating extension pg_trgm: %v", err)
	}

	_, err = db.Exec("DROP TABLE IF EXISTS cities, states, countries;")
	if err != nil {
		log.Fatalf("Error dropping gis tables: %v", err)
	}

	_, err = db.Exec(`
    CREATE TABLE IF NOT EXISTS countries (
      country_name TEXT PRIMARY KEY
    );`)
	if err != nil {
		log.Fatalf("Error creating table countries: %v", err)
	}

	_, err = db.Exec(`
    CREATE TABLE IF NOT EXISTS states (
      state_name TEXT,
      country_name TEXT NOT NULL,
      PRIMARY KEY (state_name, country_name),
      FOREIGN KEY (country_name) REFERENCES countries (country_name)
    );`)
	if err != nil {
		log.Fatalf("Error creating table states: %v", err)
	}

	_, err = db.Exec(`
    CREATE TABLE IF NOT EXISTS cities (
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      ranking SMALLINT NOT NULL,
      city_name TEXT NOT NULL,
      state_name TEXT NOT NULL,
      country_name TEXT NOT NULL,
      PRIMARY KEY (city_name, state_name, country_name, ranking),
      FOREIGN KEY (state_name, country_name) REFERENCES states (state_name, country_name)
    );`)
	if err != nil {
		log.Fatalf("Error creating table cities: %v", err)
	}

	_, err = db.Exec(`CREATE INDEX cities_trgm_gin ON cities USING gin (city_name gin_trgm_ops);`)
	if err != nil {
		log.Fatalf("Error creating index: %v", err)
	}

	populateTables(db)

	elapsedTime := time.Since(startTime).Milliseconds()
	fmt.Printf("\nTime taken: %vms\n", elapsedTime) // 1008048ms ~16.8 min
}

func populateTables(db *sql.DB) {
	var filepath = "./worldcities.csv"
	file, err := os.Open(filepath)
	if err != nil {
		log.Fatalf("Error opening CSV file %v: %v", filepath, err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("Error reading records: %v", err)
	}
	records = records[1:] //remove header row (column names row)

	statesByCountry := make(map[string]map[string]struct{})

	var rows []models.City
	for _, row := range records {
		ranking, err := strconv.ParseInt(row[16], 10, 16)
		if err != nil {
			log.Fatalf("Error converting ranking to int16: %v", err)
		}
		lat, err := strconv.ParseFloat(row[3], 32)
		if err != nil {
			log.Fatalf("Error converting lat to float32: %v", err)
		}
		lng, err := strconv.ParseFloat(row[4], 32)
		if err != nil {
			log.Fatalf("Error converting lng to float32: %v", err)
		}

		city := models.City{
			City:    row[1],
			State:   row[9],
			Country: row[5],
			Ranking: int16(ranking),
			Lat:     float32(lat),
			Lng:     float32(lng),
		}

		rows = append(rows, city)

		if _, exists := statesByCountry[city.Country]; !exists {
			statesByCountry[city.Country] = make(map[string]struct{})
		}

		statesByCountry[city.Country][city.State] = struct{}{}
	}

	insertCountryQuery := `
		INSERT INTO countries (country_name)
		VALUES ($1)
    ON CONFLICT DO NOTHING;`

	insertStateQuery := `
		INSERT INTO states (state_name, country_name)
		SELECT $1, $2
		WHERE EXISTS (SELECT 1 FROM countries WHERE country_name = $2)
		ON CONFLICT DO NOTHING;`

	insertCityQuery := `
		INSERT INTO cities (city_name, state_name, country_name, ranking, lat, lng)
		SELECT $1, $2, $3, $4, $5, $6
		WHERE EXISTS (
			SELECT 1 
			FROM states 
			WHERE state_name = $2
		) AND EXISTS (
			SELECT 1 
			FROM countries 
			WHERE country_name = $3
		)
		ON CONFLICT DO NOTHING;`

	jsonCountries, err := getCountriesJSON()
	if err != nil {
		log.Fatalf("Error: getting countries/states from JSON %v", err)
	}

	for country, states := range statesByCountry {
		if _, exists := jsonCountries[country]; !exists {
			continue
		}
		_, err := db.Exec(insertCountryQuery, country)
		if err != nil {
			log.Fatalf("Error executing insert query into countries: %v", err)
		}

		for state := range states {
			_, err := db.Exec(insertStateQuery, state, country)
			if err != nil {
				log.Fatalf("Error executing insert query into states: %v", err)
			}
		}
	}

	for i, row := range rows {
		if _, exists := jsonCountries[row.Country]; !exists {
			continue
		}

		if row.City == "Bressanone" {
			fmt.Printf("Bressanone Row: %v, %v", row, row.City)
		}
		_, err := db.Exec(
			insertCityQuery, row.City, row.State, row.Country, row.Ranking, row.Lat, row.Lng)
		if err != nil {
			log.Fatalf("Error executing insert query into cities: %v", err)
		}
		if i%30000 == 0 {
			fmt.Printf("\rInserting Cities: %v%%", math.Round(float64(i)/43680))
		}
	}
}

func getCountriesJSON() (map[string]interface{}, error) {
	file, err := os.Open("countries.json")
	if err != nil {
		return nil, fmt.Errorf("opening countries.json %v", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Error reading countries.json %v", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(data, &result)
	if err != nil {
		return nil, fmt.Errorf("unmarshaling JSON: %v", err)
	}

	return result, nil
}
