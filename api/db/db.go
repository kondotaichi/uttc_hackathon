package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func Init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	dbUser := os.Getenv("MYSQL_USER")
	dbPassword := os.Getenv("MYSQL_PASSWORD")
	dbHost := os.Getenv("MYSQL_HOST")
	dbName := os.Getenv("MYSQL_DATABASE")

	log.Printf("MYSQL_USER: %s", dbUser)
	log.Printf("MYSQL_PASSWORD: %s", dbPassword)
	log.Printf("MYSQL_HOST: %s", dbHost)
	log.Printf("MYSQL_DATABASE: %s", dbName)

	dsn := fmt.Sprintf("%s:%s@%s/%s", dbUser, dbPassword, dbHost, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	DB = db
}
