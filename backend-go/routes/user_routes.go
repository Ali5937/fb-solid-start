package routes

import (
	"database/sql"
	"net/http"

	handlers "github.com/Ali5937/fb-solid-start/backend-go/handlers/user"
	mWare "github.com/Ali5937/fb-solid-start/backend-go/middleware"
	"github.com/go-chi/chi/v5"
)

func UserRoutes(r chi.Router, db *sql.DB) {
	r.Route("/user", func(r chi.Router) {
		r.Post("/signup", func(w http.ResponseWriter, r *http.Request) {
			handlers.PostUserSignup(w, r, db)
		})
		r.Post("/login", func(w http.ResponseWriter, r *http.Request) {
			handlers.PostUserLogin(w, r, db)
		})
		r.Get("/email", func(w http.ResponseWriter, r *http.Request) {
			handlers.GetUserEmail(w, r, db)
		})

		r.Group(func(r chi.Router) {
			r.Use(mWare.ValidateAccessToken)

			r.Post("/logout", func(w http.ResponseWriter, r *http.Request) {
				handlers.PostUserLogout(w, r, db)
			})
			r.Get("/items", func(w http.ResponseWriter, r *http.Request) {
				handlers.GetUserItems(w, r, db)
			})
		})
	})
}
