package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"api/db" // dbパッケージをインポート

	"github.com/google/uuid"
)

type Like struct {
	ID     string `json:"id"`
	UserID string `json:"user_id"`
	PostID string `json:"post_id"`
}

func MakeLikeHandler(w http.ResponseWriter, r *http.Request) {
	var like Like
	if err := json.NewDecoder(r.Body).Decode(&like); err != nil {
		log.Println("Error decoding like request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received like request: %+v", like)

	// PostIDの検証
	var postID string
	err := db.DB.QueryRow("SELECT id FROM Posts WHERE id = ?", like.PostID).Scan(&postID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("Error validating post ID: no rows in result set")
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}
		log.Println("Error validating post ID:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	like.ID = uuid.New().String()

	query := "INSERT INTO Likes (id, user_id, post_id) VALUES (?, ?, ?)"
	_, err = db.DB.Exec(query, like.ID, like.UserID, like.PostID)
	if err != nil {
		log.Println("Error inserting like into database:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Like created successfully")
	w.WriteHeader(http.StatusCreated)
}
