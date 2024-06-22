# Stage 1: Build the Go app
FROM golang:1.16 as builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod tidy

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
RUN apk --no-cache add ca-certificates openssh

# Set the working directory
WORKDIR /root/

# Copy the Go binary from the builder stage
COPY --from=builder /app/main .

# Expose the application port
EXPOSE 8080

# Expose the SSH port
EXPOSE 22

# Set root password for SSH (please change 'yourpassword' to a secure password)
RUN echo 'root:yourpassword' | chpasswd

# Allow root login via SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Start SSH service and run the Go application
CMD ["/bin/sh", "-c", "sshd && ./main"]
