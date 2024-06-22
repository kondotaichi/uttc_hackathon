# syntax=docker/dockerfile:1

FROM golang:1.22 as build

# 作業ディレクトリを設定
WORKDIR /app

# /appにgo.modをコピーしgo modをダウンロード
COPY . .

RUN go mod download

# go modのダウンロード、Goアプリのビルド
RUN go build -v main.go

# ポートを公開
EXPOSE 8080

# コンテナ起動時に実行するコマンドを指定
CMD ["go", "run", "main.go"]