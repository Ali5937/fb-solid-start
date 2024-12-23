package models

import (
	"encoding/json"
	"log"
	"time"
)

type CacheItem struct {
	Data      []string
	ExpiresAt time.Time
}

type GetItem struct {
	Id             int64
	Lng            float64
	Lat            float64
	Type           int16
	EuroPrice      int64
	CreatedAt      string
	OriginalPrice  int64
	Size           int16
	CurrencyCode   string
	CurrencyName   string
	CurrencySymbol string
	FirstPicture   int64
	City           string
	State          string
	Country        string
}

type PostItem struct {
	Id                int64
	UserID            string
	OriginalPrice     int64
	EuroPrice         int32
	FirstPicture      int16
	Type              int16
	Size              int16
	Plot              *int32
	Bed               int16
	Bath              int16
	LikeCount         int16
	Ranking           int16
	Lng               float64
	Lat               float64
	Country           string
	State             string
	City              string
	CurrencyName      string
	CurrencySymbol    string
	CurrencyCode      string
	FirmBoost         *int16
	RealtorFeePercent *float32
	Floor             *int16
	Floors            *int16
	Heating           *int16
	UtilityCost       *int16
	Deposit           *int16
	IsActive          bool
	PetsAllowed       *bool
	Cooling           *bool
	Elevator          *bool
	Garden            *bool
	SwimmingPool      *bool
	Parking           *bool
	CouncilHome       *bool
	AuctionDate       *time.Time
	FirmID            *string
	Pictures          []int16
}

type GetCity struct {
	City    string
	State   string
	Country string
	Lat     float64
	Lng     float64
}

type City struct {
	City    string
	State   string
	Country string
	Ranking int16
	Lat     float32
	Lng     float32
}

type Currency struct {
	Code         string  `json:"code"`
	Name         string  `json:"name"`
	Symbol       string  `json:"symbol"`
	ExchangeRate float64 `json:"exchangeRate"`
}

type CurrencyResponse struct {
	Success   bool
	Timestamp int64
	Base      string
	Rates     map[string]float64
}

func (c *Currency) UnmarshalJSON(data []byte) error {
	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	if code, ok := raw["code"].(string); ok {
		c.Code = code
	} else {
		log.Fatalf("invalid or missing 'code'")
	}

	if name, ok := raw["name"].(string); ok {
		c.Name = name
	} else {
		log.Fatalf("invalid or missing 'name'")
	}

	if symbol, ok := raw["symbol"].(string); ok {
		c.Symbol = symbol
	} else {
		log.Fatalf("invalid or missing 'symbol'")
	}

	if exchangeRate, ok := raw["exchangeRate"].(float64); ok {
		c.ExchangeRate = exchangeRate
	} else {
		log.Fatalf("invalid or missing 'exchangeRate'")
	}

	return nil
}
