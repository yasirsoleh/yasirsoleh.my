use super::Error;

#[derive(serde::Deserialize)]
pub struct ListParams {
    #[serde(default)]
    pub filters: std::collections::HashMap<String, String>,
    #[serde(default)]
    pub sorters: std::collections::HashMap<String, String>,
    pub page: Option<i32>,
    pub page_size: Option<i32>,
}

pub fn total_pages(params: &ListParams, total: i64) -> Result<i64, Error> {
    let page_size = params.page_size.unwrap_or(10) as i64;
    if page_size <= 0 {
        return Err(Error::DatabaseError("invalid page size".to_string()));
    }
    let total_pages = (total + page_size - 1) / page_size;
    Ok(total_pages)
}
