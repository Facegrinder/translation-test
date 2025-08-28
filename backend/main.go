package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

// tiny in-memory translations store: translations[lang][namespace]
var translations = map[string]map[string]map[string]string{
	"en": {
		"common": {
			"title":     "Hello, World!",
			"welcome":   "Welcome to i18next with Go backend",
			"helloUser": "Hello, {{name}}",
		},
	},
	"de": {
		"common": {
			"title":     "Hallo, Welt!",
			"welcome":   "Willkommen bei i18next mit Go-Backend",
			"helloUser": "Hallo, {{name}}",
		},
	},
}

func main() {
	mux := http.NewServeMux()

	// Health endpoint
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// Serve i18next backend format: /locales/{lng}/{ns}.json
	mux.HandleFunc("/locales/", func(w http.ResponseWriter, r *http.Request) {
		// Basic CORS for browser dev; Vite proxy can also be used
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=utf-8")

		// Path like /locales/en/common.json
		parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/locales/"), "/")
		if len(parts) != 2 {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}
		lng := parts[0]
		ns := strings.TrimSuffix(parts[1], ".json")

		byLang, ok := translations[lng]
		if !ok {
			http.NotFound(w, r)
			return
		}
		payload, ok := byLang[ns]
		if !ok {
			http.NotFound(w, r)
			return
		}

		if err := json.NewEncoder(w).Encode(payload); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})

	// Wrap with CORS so the frontend at http://localhost:5173 can call directly
	handler := withCORS(mux)

	addr := ":8080"
	fmt.Printf("Backend listening on %s\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}

// withCORS adds permissive CORS headers for local dev and handles OPTIONS preflight
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
