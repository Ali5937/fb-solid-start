package routes

import (
	"database/sql"
	"net/http"

	handlers "github.com/Ali5937/fb-solid-start/backend-go/handlers/search"
	"github.com/go-chi/chi/v5"
)

func SearchRoutes(r chi.Router, db *sql.DB) {
	r.Get("/cities", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetCities(w, r, db)
	})
	r.Get("/all-cities", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetAllCities(w, r, db)
	})

	r.Get("/states", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetStates(w, r, db)
	})

	r.Get("/all-states", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetAllStates(w, r, db)
	})

	r.Get("/countries", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetCountries(w, r, db)
	})

	r.Get("/all-countries", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetAllCountries(w, r, db)
	})

}
