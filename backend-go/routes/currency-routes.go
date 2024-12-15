package routes

import (
	"net/http"

	"github.com/Ali5937/fb-solid-start/backend-go/handlers"
	"github.com/go-chi/chi/v5"
)

func CurrencyRoutes(r chi.Router) {
	r.Get("/currencies", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetAllCurrencies(w, r)
	})
}
