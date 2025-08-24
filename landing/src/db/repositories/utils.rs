use super::Error;

#[derive(serde::Deserialize, Debug)]
pub struct ListParams {
    #[serde(default, rename = "filters")]
    pub filters: std::collections::HashMap<String, String>,
    #[serde(default, rename = "sorters")]
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

// Alternative: Handle the nested structure manually
#[derive(Debug, serde::Deserialize)]
pub struct RawListParams {
    #[serde(flatten)]
    pub raw: std::collections::HashMap<String, String>,
}

impl From<RawListParams> for ListParams {
    fn from(raw: RawListParams) -> Self {
        let mut filters = std::collections::HashMap::new();
        let mut sorters = std::collections::HashMap::new();
        let mut page = None;
        let mut page_size = None;

        for (key, value) in raw.raw {
            if let Some(filter_key) = key
                .strip_prefix("filters[")
                .and_then(|s| s.strip_suffix("]"))
            {
                filters.insert(filter_key.to_string(), value);
            } else if let Some(sort_key) =
                key.strip_prefix("sorts[").and_then(|s| s.strip_suffix("]"))
            {
                sorters.insert(sort_key.to_string(), value);
            } else if key == "page" {
                page = value.parse().ok();
            } else if key == "page_size" {
                page_size = value.parse().ok();
            }
        }

        ListParams {
            filters,
            sorters,
            page,
            page_size,
        }
    }
}
