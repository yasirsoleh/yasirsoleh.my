use super::AppState;
use crate::db::repositories::utils::RawListParams;

pub async fn list_posts(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Query(params): axum::extract::Query<RawListParams>,
) -> impl axum::response::IntoResponse {
    let posts = match state.queries.list_posts(params.into()).await {
        Ok(posts) => posts,
        Err(err) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::response::Json(serde_json::json!({ "error": err })),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!(posts)),
    )
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

    let post = match state.queries.get_post(post_id).await {
        Ok(post) => post,
        Err(err) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::response::Json(serde_json::json!({ "error": err })),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!({ "data": post })),
    )
}

pub async fn create_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::Json(params): axum::Json<crate::db::repositories::posts::CreatePostParams>,
) -> impl axum::response::IntoResponse {
    let post = match state.queries.create_post(claims.sub, params).await {
        Ok(post) => post,
        Err(err) => {
            return (
                axum::http::StatusCode::BAD_REQUEST,
                axum::response::Json(serde_json::json!({ "error": err })),
            );
        }
    };

    (
        axum::http::StatusCode::CREATED,
        axum::response::Json(serde_json::json!({ "data": post })),
    )
}

pub async fn update_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::extract::Path(post_id): axum::extract::Path<uuid::Uuid>,
    axum::Json(params): axum::Json<crate::db::repositories::posts::UpdatePostParams>,
) -> impl axum::response::IntoResponse {
    let post = match state.queries.update_post(claims.sub, post_id, params).await {
        Ok(post) => post,
        Err(err) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::response::Json(serde_json::json!({ "error": err })),
            );
        }
    };

    (
        axum::http::StatusCode::OK,
        axum::response::Json(serde_json::json!({ "data": post })),
    )
}

pub async fn delete_post(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<crate::routes::accounts::Claims>,
    axum::extract::Path(post_id): axum::extract::Path<uuid::Uuid>,
) -> impl axum::response::IntoResponse {
    if let Err(err) = state.queries.delete_post(claims.sub, post_id).await {
        return (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            axum::response::Json(serde_json::json!({ "error": err })),
        );
    }

    (
        axum::http::StatusCode::NO_CONTENT,
        axum::response::Json(serde_json::json!({})),
    )
}
