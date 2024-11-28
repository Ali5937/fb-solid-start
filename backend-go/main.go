package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Ali5937/fb-solid-start/backend-go/db"
	"github.com/Ali5937/fb-solid-start/backend-go/routes"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	pgDB, err := db.InitDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer pgDB.Close()

	r := chi.NewRouter()
	corsHeaders := handlers.AllowedOrigins([]string{"http://localhost:3000"})
	corsMethods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})
	corsHeadersAllowed := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	corsCredentials := handlers.AllowCredentials()

	r.Use(handlers.CORS(corsHeaders, corsMethods, corsHeadersAllowed, corsCredentials))

	r.Route("/api", func(api chi.Router) {
		routes.ItemRoutes(api, pgDB)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}

	log.Printf("Server is running on port %+v", port)
	server := &http.Server{
		Addr:    "127.0.0.1:" + port,
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
