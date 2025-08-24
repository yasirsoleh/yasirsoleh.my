mod accounts;
mod posts;
use crate::db::repositories::Queries;

#[derive(Clone)]
pub struct AppState {
    pub queries: Queries,
    pub jwt_secret: String,
}

#[derive(Clone)]
pub struct JwtSecret(pub String);

pub fn setup_make_app(pool: sqlx::Pool<sqlx::Postgres>, jwt_secret: JwtSecret) -> axum::Router {
    let queries = Queries::new(pool);

    let state = AppState {
        queries,
        jwt_secret: jwt_secret.0.clone(),
    };

    let authenticated_routes = axum::Router::new()
        .route("/api/posts", axum::routing::post(posts::create_post))
        .route(
            "/api/posts/{post_id}",
            axum::routing::put(posts::update_post),
        )
        .route(
            "/api/posts/{post_id}",
            axum::routing::delete(posts::delete_post),
        )
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    axum::Router::new()
        .route(
            "/api/accounts",
            axum::routing::post(accounts::create_account),
        )
        .route("/api/login", axum::routing::post(accounts::login))
        .route("/api/posts", axum::routing::get(posts::list_posts))
        .route("/api/posts/{post_id}", axum::routing::get(posts::get_post))
        .merge(authenticated_routes)
        .fallback_service(axum::routing::get(serve_frontend))
        .route_layer(axum::middleware::from_fn(print_middleware))
        .with_state(state)
}

#[derive(rust_embed::RustEmbed)]
#[folder = "src/frontend/dist"]
struct ClientAssets;

async fn serve_frontend(request: axum::extract::Request) -> impl axum::response::IntoResponse {
    let path = request.uri().path().trim_start_matches('/');
    let path = if path.is_empty() { "index.html" } else { path };
    match ClientAssets::get(path) {
        Some(asset) => {
            let mime_type = mime_guess::from_path(path).first_or_octet_stream();

            axum::response::Response::builder()
                .header(axum::http::header::CONTENT_TYPE, mime_type.as_ref())
                .header(axum::http::header::CACHE_CONTROL, "public, max-age=3600")
                .status(axum::http::StatusCode::OK)
                .body(axum::body::Body::from(asset.data))
                .unwrap()
        }
        None => {
            // Fallback to index.html for SPA routing
            match ClientAssets::get("index.html") {
                Some(index) => axum::response::Response::builder()
                    .header(axum::http::header::CONTENT_TYPE, "text/html; charset=utf-8")
                    .status(axum::http::StatusCode::OK)
                    .body(axum::body::Body::from(index.data))
                    .unwrap(),
                None => axum::response::Response::builder()
                    .status(axum::http::StatusCode::NOT_FOUND)
                    .body(axum::body::Body::from("404 Not Found"))
                    .unwrap(),
            }
        }
    }
}

async fn print_middleware(
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> impl axum::response::IntoResponse {
    println!("{} request on {}", request.method(), request.uri());
    next.run(request).await
}

async fn auth_middleware(
    axum::extract::State(state): axum::extract::State<AppState>,
    headers: axum::http::HeaderMap,
    mut request: axum::extract::Request,
    next: axum::middleware::Next,
) -> Result<axum::response::Response, impl axum::response::IntoResponse> {
    let auth_header = match headers.get(axum::http::header::AUTHORIZATION) {
        Some(header) => header,
        None => {
            return Err((
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": "missing authorization header"})),
            ));
        }
    };

    let token = match auth_header.to_str() {
        Ok(token) => token,
        Err(_) => {
            return Err((
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": "invalid authorization header"})),
            ));
        }
    };

    let token = match token.strip_prefix("Bearer ") {
        Some(token) => token,
        None => {
            return Err((
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": "invalid authorization header"})),
            ));
        }
    };

    let claims = match jsonwebtoken::decode::<accounts::Claims>(
        token,
        &jsonwebtoken::DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &jsonwebtoken::Validation::default(),
    ) {
        Ok(claims) => claims,
        Err(_) => {
            return Err((
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": "invalid token"})),
            ));
        }
    };

    request.extensions_mut().insert(claims.claims);

    Ok(next.run(request).await)
}
