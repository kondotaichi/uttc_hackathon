package main

import "time"

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Nickname string `json:"nickname"`
}

type Post struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Content       string    `json:"content"`
	CreatedAt     time.Time `json:"created_at"`
	Nickname      string    `json:"nickname"`
	LikeCount     int       `json:"like_count"`
	IsReply       bool      `json:"is_reply"`
	ParentID      string    `json:"parent_id"`
	ParentContent string    `json:"parent_content"`
}
