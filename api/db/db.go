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
    dbPort := os.Getenv("MYSQL_PORT")
    dbName := os.Getenv("MYSQL_DATABASE")

    log.Printf("MYSQL_USER: %s", dbUser)
    log.Printf("MYSQL_PASSWORD: %s", dbPassword)
    log.Printf("MYSQL_HOST: %s", dbHost)
    log.Printf("MYSQL_PORT: %s", dbPort)
    log.Printf("MYSQL_DATABASE: %s", dbName)

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPassword, dbHost, dbPort, dbName)

    DB, err = sql.Open("mysql", dsn)
    if err != nil {
        log.Fatalf("Error opening database: %v", err)
    }

    if err = DB.Ping(); err != nil {
        log.Fatalf("Error connecting to database: %v", err)
    }
}