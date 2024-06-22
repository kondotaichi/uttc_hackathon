package main

import (
	"api/db"
	"api/handlers"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)
//こめんと

func main() {
	db.Init() // DB初期化

	r := mux.NewRouter()

	r.HandleFunc("/api/users", handlers.MakeUserHandler).Methods("POST")
	r.HandleFunc("/api/posts", handlers.CreatePostHandler).Methods("POST")
	r.HandleFunc("/api/posts", handlers.FetchPostsHandler).Methods("GET")
	r.HandleFunc("/api/likes", handlers.MakeLikeHandler).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"https://uttc-hackathon3-lx5cqmshrq-uc.a.run.app/"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type"},
	})

	handler := c.Handler(r)
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
