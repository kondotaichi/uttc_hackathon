// api/handlers/posts.go

package handlers

import (
	"api/db"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID            string `json:"id"`
	UserID        string `json:"user_id"`
	Content       string `json:"content"`
	CreatedAt     string `json:"created_at"`
	Nickname      string `json:"nickname"`
	LikeCount     int    `json:"like_count"`
	IsReply       bool   `json:"is_reply"`
	ParentID      string `json:"parent_id"`
	ParentContent string `json:"parent_content"`
	ParentUser    string `json:"parent_user"`
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	var post Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		log.Println("Error decoding post request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received post request: %+v", post)

	var userID string
	err := db.DB.QueryRow("SELECT id FROM Users WHERE id = ?", post.UserID).Scan(&userID)
	if err != nil {
		log.Println("Error validating user ID:", err)
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	post.ID = uuid.New().String()
	post.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	query := "INSERT INTO Posts (id, user_id, content, created_at, is_reply, parent_id) VALUES (?, ?, ?, ?, ?, ?)"
	_, err = db.DB.Exec(query, post.ID, post.UserID, post.Content, post.CreatedAt, post.IsReply, post.ParentID)
	if err != nil {
		log.Println("Error creating post:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Post created successfully")
	w.WriteHeader(http.StatusCreated)
}

func FetchPostsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
        SELECT p.id, p.user_id, p.content, p.created_at, IFNULL(u.nickname, '') as nickname, 
        (SELECT COUNT(DISTINCT id) FROM Likes l WHERE l.post_id = p.id) as like_count, p.is_reply, p.parent_id,
        IFNULL(parent.content, '') as parent_content, IFNULL(parent_user.nickname, '') as parent_user
        FROM Posts p
        JOIN Users u ON p.user_id = u.id
        LEFT JOIN Posts parent ON p.parent_id = parent.id
        LEFT JOIN Users parent_user ON parent.user_id = parent_user.id
        ORDER BY p.created_at DESC
    `)
	if err != nil {
		log.Printf("Error fetching posts: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var post Post
		var parentID sql.NullString
		if err := rows.Scan(
			&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.Nickname,
			&post.LikeCount, &post.IsReply, &parentID, &post.ParentContent, &post.ParentUser); err != nil {
			log.Printf("Error scanning post: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if parentID.Valid {
			post.ParentID = parentID.String
		} else {
			post.ParentID = ""
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows iteration error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Printf("Error encoding posts to JSON: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
