use super::AppState;
use crate::db::repositories::{accounts::CreateAccountParams, accounts::LoginParams};

pub async fn register(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::Json(params): axum::Json<CreateAccountParams>,
) -> impl axum::response::IntoResponse {
    let account = match state.queries.create_account(&params).await {
        Ok(account) => account,
        Err(err) => {
            return (
                axum::http::StatusCode::BAD_REQUEST,
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

    let token = match token_res {
        Ok(token) => token,
        Err(err) => {
            return (
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": err.to_string()})),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!({"token": token})),
    )
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
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

    let token = match token_res {
        Ok(token) => token,
        Err(err) => {
            return (
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": err.to_string()})),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!({"token": token})),
    )
}

pub async fn me(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
) -> impl axum::response::IntoResponse {
    let account = match state.queries.me(claims.sub).await {
        Ok(account) => account,
        Err(err) => {
            return (
                axum::http::StatusCode::UNAUTHORIZED,
                axum::response::Json(serde_json::json!({"error": err})),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!({"data": account})),
    )
}
