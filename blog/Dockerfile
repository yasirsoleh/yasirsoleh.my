FROM docker.io/oven/bun:1 AS frontend-build
WORKDIR /usr/src/app
COPY ./src/frontend/package.json ./src/frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY ./src/frontend ./
RUN bun install
RUN bun run build

FROM rust:1.89-slim AS backend-build
WORKDIR /app
RUN rustup target add x86_64-unknown-linux-musl && \
    apt update && \
    apt install -y musl-tools musl-dev && \
    update-ca-certificates
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY .sqlx ./.sqlx
COPY --from=frontend-build /usr/src/app/dist ./src/frontend/dist
RUN cargo build --target x86_64-unknown-linux-musl --release

FROM docker.io/alpine:3.14
WORKDIR /app
RUN apk add tzdata ca-certificates
COPY --from=backend-build /app/target/x86_64-unknown-linux-musl/release/landing /app/
ENTRYPOINT ["/app/landing"]