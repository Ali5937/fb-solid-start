package middleware

import (
	"fmt"
	"net/http"
	"time"
)

func RequestTiming(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		elapsed := time.Since(start).Milliseconds()
		fmt.Printf("Time: %vms - %s %s\n", r.Method, r.URL.Path, elapsed)
	})
}
