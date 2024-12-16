package routes

import (
	"database/sql"
	"net/http"

	handlers "github.com/Ali5937/fb-solid-start/backend-go/handlers/item"
	"github.com/go-chi/chi/v5"
)

func ItemRoutes(r chi.Router, db *sql.DB) {
	r.Get("/items", func(w http.ResponseWriter, r *http.Request) {
		handlers.Items(w, r, db)
	})
}
