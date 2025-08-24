use super::AppState;
use crate::db::repositories::{accounts::CreateAccountParams, accounts::LoginParams};

pub async fn create_account(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::Json(params): axum::Json<CreateAccountParams>,
) -> impl axum::response::IntoResponse {
    match state.queries.create_account(&params).await {
        Ok(accounts) => (
            axum::http::StatusCode::CREATED,
            axum::response::Json(serde_json::json!({"data": accounts})),
        ),
        Err(err) => (
            axum::http::StatusCode::BAD_REQUEST,
            axum::response::Json(serde_json::json!({"error": err})),
        ),
    }
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Claims {
    pub sub: uuid::Uuid,
    pub exp: i64,
    pub email: String,
    pub account_name: String,
}

pub async fn login(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::Json(params): axum::Json<LoginParams>,
) -> impl axum::response::IntoResponse {
    let account = match state.queries.login(params).await {
        Ok(account) => account,
        Err(err) => {
            return (
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": err})),
            );
        }
    };

    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .unwrap()
        .timestamp();

    let claims = Claims {
        sub: account.id,
        exp: expiration,
        email: account.email,
        account_name: account.account_name,
    };

    let token_res = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(state.jwt_secret.as_ref()),
    );

    match token_res {
        Ok(token) => (
            axum::http::StatusCode::OK,
            axum::response::Json(serde_json::json!({"token": token})),
        ),
        Err(err) => (
            axum::http::StatusCode::UNAUTHORIZED,
            axum::response::Json(serde_json::json!({"error": err.to_string()})),
        ),
    }
}
