package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Ali5937/fb-solid-start/backend-go/config"
	mWare "github.com/Ali5937/fb-solid-start/backend-go/middleware"
	"github.com/Ali5937/fb-solid-start/backend-go/pgdb"
	"github.com/Ali5937/fb-solid-start/backend-go/routes"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	db, err := pgdb.InitDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300, // 5 min
	}))
	r.Use(middleware.Compress(5)) // Do gzipping in Nginx?
	r.Use(mWare.RequestTiming)

	r.Route("/api", func(api chi.Router) {
		routes.ItemRoutes(api, db)
		routes.UserRoutes(api, db)
		routes.CurrencyRoutes(api)
		routes.SearchRoutes(api, db)
	})

	log.Printf("Server is running on port %+v", config.Port)
	server := &http.Server{
		Addr:    "127.0.0.1:" + config.Port,
		Handler: r,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	server.Close()
}
