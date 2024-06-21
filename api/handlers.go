package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func signUpHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Error decoding signup request: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query := "INSERT INTO Users (id, email, password_hash, nickname) VALUES (?, ?, ?, ?)"
	_, err = db.Exec(query, user.ID, user.Email, string(hashedPassword), user.Nickname)
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("User created: %s, email: %s", user.ID, user.Email)
	w.WriteHeader(http.StatusCreated)
}

func createPostHandler(w http.ResponseWriter, r *http.Request) {
	var post Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		log.Println("Error decoding post request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received post request: %+v", post)

	var userID string
	err := db.QueryRow("SELECT id FROM Users WHERE id = ?", post.UserID).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("Error validating user ID: no rows in result set for user ID:", post.UserID)
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
		} else {
			log.Println("Error validating user ID:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	post.ID = uuid.New().String()
	post.CreatedAt = time.Now()

	query := "INSERT INTO Posts (id, user_id, content, created_at, is_reply, parent_id) VALUES (?, ?, ?, ?, ?, ?)"
	_, err = db.Exec(query, post.ID, post.UserID, post.Content, post.CreatedAt, post.IsReply, post.ParentID)
	if err != nil {
		log.Println("Error creating post:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Post created successfully")
	w.WriteHeader(http.StatusCreated)
}

func fetchPostsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
        SELECT p.id, p.user_id, p.content, p.created_at, IFNULL(u.nickname, '') as nickname, 
        (SELECT COUNT(*) FROM Likes l WHERE l.post_id = p.id) as like_count, p.is_reply, IFNULL(p.parent_id, '') as parent_id,
        IFNULL((SELECT content FROM Posts WHERE id = p.parent_id), '') as parent_content
        FROM Posts p
        JOIN Users u ON p.user_id = u.id
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
		var (
			post         Post
			createdAtRaw []uint8
		)
		if err := rows.Scan(&post.ID, &post.UserID, &post.Content, &createdAtRaw, &post.Nickname, &post.LikeCount, &post.IsReply, &post.ParentID, &post.ParentContent); err != nil {
			log.Printf("Error scanning post: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		createdAt, err := time.Parse("2006-01-02 15:04:05", string(createdAtRaw))
		if err != nil {
			log.Printf("Error parsing created_at: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		post.CreatedAt = createdAt

		posts = append(posts, post)
	}

	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Printf("Error encoding posts to JSON: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func makeLikeHandler(w http.ResponseWriter, r *http.Request) {
	var like struct {
		ID     string `json:"id"`
		UserID string `json:"user_id"`
		PostID string `json:"post_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&like); err != nil {
		log.Println("Error decoding like request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Received like request: %+v", like)

	like.ID = uuid.New().String()

	query := "INSERT INTO Likes (id, user_id, post_id) VALUES (?, ?, ?)"
	_, err := db.Exec(query, like.ID, like.UserID, like.PostID)
	if err != nil {
		log.Println("Error inserting like into database:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Like created successfully")
	w.WriteHeader(http.StatusCreated)
}