use super::{Error, Queries, utils::ListParams, utils::total_pages};

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct Post {
    pub id: sqlx::types::Uuid,
    pub account_id: sqlx::types::Uuid,
    pub account_name: String,
    pub contents: String,
}

#[derive(serde::Serialize)]
pub struct PostsList {
    pub data: Vec<Post>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub page_total: i64,
}

#[derive(serde::Deserialize)]
pub struct CreatePostParams {
    pub contents: String,
}

#[derive(serde::Deserialize)]
pub struct UpdatePostParams {
    pub contents: String,
}

impl Queries {
    async fn list_posts_data(&self, params: &ListParams) -> Result<Vec<Post>, Error> {
        let mut query = sqlx::QueryBuilder::new(
            r#"
            select p.id, p.account_id, a.account_name, p.contents
            from posts p
            join accounts a on p.account_id = a.id
            where p.deleted_at is null and a.deleted_at is null
            "#,
        );

        for (filter, value) in params.filters.iter() {
            query.push(" and ");

            match filter.as_str() {
                "account_name" => {
                    query.push("a.account_name like ");
                    query.push_bind(format!("%%{}%%", value));
                }
                "contents" => {
                    query.push("p.contents like ");
                    query.push_bind(format!("%%{}%%", value));
                }
                _ => {
                    return Err(Error::DatabaseError("invalid filter".to_string()));
                }
            }
        }

        for (index, (field, value)) in params.sorters.iter().enumerate() {
            if index > 0 {
                query.push(" and ");
            } else {
                query.push(" sort by ");
            }

            match field.as_str() {
                "account_name" => query.push("a.account_name "),
                _ => return Err(Error::DatabaseError("invalid sorter field".to_string())),
            };

            match value.as_str() {
                "asc" => query.push("asc"),
                "desc" => query.push("desc"),
                _ => return Err(Error::DatabaseError("invalid sorter value".to_string())),
            };
        }

        let page = params.page.unwrap_or(1);
        let page_size = params.page_size.unwrap_or(10);
        let start = (page - 1) * page_size;
        let end = start + page_size;
        let limit: i32 = end - start;
        query.push(" limit ");
        query.push_bind(limit as i64);
        query.push(" offset ");
        query.push_bind(start as i64);

        let posts = query.build_query_as::<Post>().fetch_all(&self.pool).await?;

        Ok(posts)
    }

    async fn list_posts_total(&self, params: &ListParams) -> Result<i64, Error> {
        let mut query = sqlx::QueryBuilder::new(
            r#"
            select count(p.id)
            from posts p
            join accounts a on p.account_id = a.id
            where p.deleted_at is null and a.deleted_at is null
            "#,
        );

        for (filter, value) in params.filters.iter() {
            query.push(" and ");

            match filter.as_str() {
                "account_name" => {
                    query.push("a.account_name like ");
                    query.push_bind(format!("%%{}%%", value));
                }
                "contents" => {
                    query.push("p.contents like ");
                    query.push_bind(format!("%%{}%%", value));
                }
                _ => {
                    return Err(Error::DatabaseError("invalid filter".to_string()));
                }
            }
        }

        let count = query
            .build_query_scalar::<i64>()
            .fetch_one(&self.pool)
            .await?;

        Ok(count)
    }

    pub async fn list_posts(&self, params: ListParams) -> Result<PostsList, Error> {
        let data = self.list_posts_data(&params).await?;
        let total = self.list_posts_total(&params).await?;

        Ok(PostsList {
            data,
            total,
            page: params.page.unwrap_or(1) as i64,
            page_size: params.page_size.unwrap_or(10) as i64,
            page_total: total_pages(&params, total)?,
        })
    }

    pub async fn get_post(&self, id: sqlx::types::Uuid) -> Result<Post, Error> {
        let post = sqlx::query_as!(
            Post,
            r#"
            select p.id, p.account_id, a.account_name, p.contents
            from posts p
            join accounts a on p.account_id = a.id
            where p.id = $1 and p.deleted_at is null and a.deleted_at is null
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|err| Error::from(err))?;

        Ok(post)
    }

    pub async fn create_post(
        &self,
        account_id: sqlx::types::Uuid,
        params: CreatePostParams,
    ) -> Result<Post, Error> {
        let post = sqlx::query_as!(
            Post,
            r#"
            with inserted_post as (
                insert into posts (account_id, contents)
                values ($1, $2)
                returning id, account_id, contents
            )
            select p.id, p.account_id, a.account_name, p.contents
            from inserted_post p
            join accounts a on p.account_id = a.id
            "#,
            account_id,
            params.contents,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|err| Error::from(err))?;

        Ok(post)
    }

    pub async fn update_post(
        &self,
        account_id: sqlx::types::Uuid,
        id: sqlx::types::Uuid,
        params: UpdatePostParams,
    ) -> Result<Post, Error> {
        let post = sqlx::query_as!(
            Post,
            r#"
            with updated_post as (
                update posts
                set updated_at = now(), contents = $1
                where deleted_at is null and account_id = $2 and id = $3
                returning id, account_id, contents
            )
            select p.id, p.account_id, a.account_name, p.contents
            from updated_post p
            join accounts a on p.account_id = a.id
            "#,
            params.contents,
            account_id,
            id,
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|err| Error::from(err))?;

        Ok(post)
    }

    pub async fn delete_post(
        &self,
        account_id: sqlx::types::Uuid,
        id: sqlx::types::Uuid,
    ) -> Result<(), Error> {
        let res = sqlx::query!(
            r#"
            update posts
            set deleted_at = now()
            where account_id = $1 and id = $2
            "#,
            account_id,
            id,
        )
        .execute(&self.pool)
        .await?;

        if res.rows_affected() < 1 {
            return Err(Error::DatabaseError("post not found".to_string()));
        }

        Ok(())
    }
}
