package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
	"github.com/Ali5937/fb-solid-start/backend-go/models"
)

func main() {

	url := fmt.Sprintf("http://api.exchangeratesapi.io/v1/latest?access_key=%s", config.CurrencyApi)

	res, err := http.Get(url)
	if err != nil {
		log.Fatalf("Error fetching from")
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Fatalf("Error reading response body: %v", err)
	}

	if res.StatusCode != http.StatusOK {
		log.Fatalf("Error Unable to fetch data: %v", err)
	}

	var response models.CurrencyResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Fatalf("Error unmarschaling JSON: %v", err)
	}
	updatedCurrencies := response.Rates

	var currenciesData map[string]models.Currency

	file, err := os.Open("./currency-template.json")
	if err != nil {
		log.Fatalf("Error opening currency-template.json: %v", err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&currenciesData)
	if err != nil {
		log.Fatalf("Error decoding JSON: %v", err)
	}

	for code, updatedCurrencyValue := range updatedCurrencies {
		if currency, exists := currenciesData[code]; exists {
			currency.ExchangeRate = updatedCurrencyValue
			currenciesData[code] = currency
		}
	}

	writeFile, err := os.OpenFile("./currency-updated.json", os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error opening currency-template.json: %v", err)
	}
	encoder := json.NewEncoder(writeFile)
	err = encoder.Encode(currenciesData)
	if err != nil {
		log.Fatalf("Error writing co currency-template.json: %v", err)
	}

	fmt.Println("Currencies updated successfully")
}
