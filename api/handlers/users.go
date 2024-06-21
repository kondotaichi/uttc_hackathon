package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"api/db" // dbパッケージをインポート

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

func MakeUserHandler(w http.ResponseWriter, r *http.Request) {
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

	query := "INSERT INTO Users (id, email, nickname, password_hash) VALUES (?, ?, ?, ?)"
	_, err = db.DB.Exec(query, user.ID, user.Email, user.Nickname, string(hashedPassword))
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("User created: %s, email: %s", user.ID, user.Email)
	w.WriteHeader(http.StatusCreated)
}
