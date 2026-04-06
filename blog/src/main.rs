mod db;
mod routes;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let db_connection_str = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:password@localhost".to_string());

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(std::time::Duration::from_secs(3))
        .connect(&db_connection_str)
        .await
        .expect("can't connect to database");

    sqlx::migrate!("src/db/migrations")
        .run(&pool)
        .await
        .expect("can't run database migrations");

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("listening on {}", listener.local_addr().unwrap());

    axum::serve(
        listener,
        routes::setup_make_app(pool, routes::JwtSecret(jwt_secret)),
    )
    .await
    .unwrap();
}
