use super::AppState;
use crate::db::repositories::utils::RawListParams;

pub async fn list_posts(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Query(params): axum::extract::Query<RawListParams>,
) -> impl axum::response::IntoResponse {
    match state.queries.list_posts(params.into()).await {
        Ok(posts) => (
            axum::http::StatusCode::OK,
            axum::response::Json(serde_json::json!(posts)),
        ),
        Err(err) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::response::Json(serde_json::json!({ "error": err })),
        ),
    }
}

pub async fn get_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Path(post_id): axum::extract::Path<String>,
) -> impl axum::response::IntoResponse {
    let post_id = match sqlx::types::Uuid::parse_str(&post_id) {
        Ok(id) => id,
        Err(_) => {
            return (
                axum::http::StatusCode::BAD_REQUEST,
                axum::response::Json(serde_json::json!({ "error": "Invalid UUID" })),
            );
        }
    };
    match state.queries.get_post(post_id).await {
        Ok(post) => (
            axum::http::StatusCode::OK,
            axum::response::Json(serde_json::json!({ "data": post })),
        ),

        Err(err) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::response::Json(serde_json::json!({ "error": err })),
        ),
    }
}

pub async fn create_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::Json(params): axum::Json<crate::db::repositories::posts::CreatePostParams>,
) -> impl axum::response::IntoResponse {
    match state.queries.create_post(claims.sub, params).await {
        Ok(post) => (
            axum::http::StatusCode::CREATED,
            axum::response::Json(serde_json::json!({ "data": post })),
        ),
        Err(err) => (
            axum::http::StatusCode::BAD_REQUEST,
            axum::response::Json(serde_json::json!({ "error": err })),
        ),
    }
}

pub async fn update_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::extract::Path(post_id): axum::extract::Path<uuid::Uuid>,
    axum::Json(params): axum::Json<crate::db::repositories::posts::UpdatePostParams>,
) -> impl axum::response::IntoResponse {
    match state.queries.update_post(claims.sub, post_id, params).await {
        Ok(post) => (
            axum::http::StatusCode::OK,
            axum::response::Json(serde_json::json!({ "data": post })),
        ),
        Err(err) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::response::Json(serde_json::json!({ "error": err })),
        ),
    }
}

pub async fn delete_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::extract::Path(post_id): axum::extract::Path<uuid::Uuid>,
) -> impl axum::response::IntoResponse {
    match state.queries.delete_post(claims.sub, post_id).await {
        Ok(_) => (
            axum::http::StatusCode::NO_CONTENT,
            axum::response::Json(serde_json::json!({})),
        ),
        Err(err) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::response::Json(serde_json::json!({ "error": err })),
        ),
    }
}
