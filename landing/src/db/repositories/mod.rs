pub mod accounts;
pub mod posts;
pub mod utils;

#[derive(Clone)]
pub struct Queries {
    pool: sqlx::PgPool,
}

impl Queries {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub enum Error {
    SqlxError(String),
    DatabaseError(String),
    LoginError(String),
}

impl From<sqlx::Error> for Error {
    fn from(value: sqlx::Error) -> Self {
        Error::SqlxError(value.to_string())
    }
}

impl From<bcrypt::BcryptError> for Error {
    fn from(value: bcrypt::BcryptError) -> Self {
        Error::DatabaseError(value.to_string())
    }
}
