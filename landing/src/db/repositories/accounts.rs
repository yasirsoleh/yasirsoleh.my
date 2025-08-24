use super::{Error, Queries};

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct Account {
    pub id: sqlx::types::Uuid,
    pub email: String,
    pub account_name: String,
    pub email_verified_at: Option<chrono::DateTime<chrono::Utc>>,
    pub photo_identifier: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct CreateAccountParams {
    pub email: String,
    pub password: String,
    pub account_name: String,
}

#[derive(serde::Deserialize)]
pub struct LoginParams {
    pub email: String,
    pub password: String,
}

impl Queries {
    pub async fn create_account(&self, params: &CreateAccountParams) -> Result<Account, Error> {
        let password_hash = bcrypt::hash(params.password.clone(), bcrypt::DEFAULT_COST)
            .map_err(|err| Error::from(err))?;

        let account = sqlx::query_as!(
            Account,
            r#"
            insert into accounts (email, password_hash, account_name)
            values ($1, $2, $3)
            returning id, email, account_name, email_verified_at, photo_identifier
            "#,
            params.email,
            password_hash,
            params.account_name
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|err| Error::from(err))?;

        Ok(account)
    }

    async fn verify_password<'e, E>(tx: E, email: String, password: String) -> Result<bool, Error>
    where
        E: 'e + sqlx::Executor<'e, Database = sqlx::Postgres>,
    {
        struct AccountPassword {
            password_hash: String,
        }

        let account_password = sqlx::query_as!(
            AccountPassword,
            r#"
            select password_hash
            from accounts
            where email = $1 and deleted_at is null
            "#,
            email,
        )
        .fetch_one(tx)
        .await
        .map_err(|err| Error::from(err))?;

        let verified = bcrypt::verify(password, &account_password.password_hash)
            .map_err(|err| Error::from(err))?;

        Ok(verified)
    }

    pub async fn login(&self, params: LoginParams) -> Result<Account, Error> {
        let mut tx = self.pool.begin().await?;

        let verified =
            Self::verify_password(&mut *tx, params.email.clone(), params.password).await?;
        if !verified {
            return Err(Error::LoginError("account not found".to_string()));
        }

        let account = sqlx::query_as!(
            Account,
            r#"
            select id, email, account_name, email_verified_at, photo_identifier
            from accounts
            where deleted_at is null and email = $1
            "#,
            params.email,
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|err| Error::from(err))?;

        tx.commit().await?;

        Ok(account)
    }
}
