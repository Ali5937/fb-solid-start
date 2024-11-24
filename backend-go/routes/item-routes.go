package routes

import (
	"database/sql"
	"net/http"

	"github.com/Ali5937/fb-solid-start/backend-go/handlers"
	"github.com/go-chi/chi/v5"
)

func Items(r chi.Router, db *sql.DB) {
	r.Get("/items", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetItemsHandler(w, r, db)
	})

}
