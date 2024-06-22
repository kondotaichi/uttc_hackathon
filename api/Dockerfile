# Stage 1: Build the Go app
FROM golang:1.16 as builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code and build the application
COPY . .
RUN go build -o main .

# Stage 2: Create the final image
FROM alpine:latest

# Set environment variables for MySQL
ENV MYSQL_HOST=unix(/cloudsql/term5-taichi-kondo:us-central1:uttc)
ENV MYSQL_PORT=3306
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=password
ENV MYSQL_DATABASE=hackathon

# Install necessary packages
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Expose the application port
EXPOSE 8080

# Run the binary
CMD ["./main"]

