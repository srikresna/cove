use serde::Deserialize;
use sqlx::sqlite::{SqliteArguments, SqliteConnectOptions, SqliteJournalMode};
use sqlx::{ConnectOptions, Connection};
use tauri::Manager;

#[derive(Deserialize)]
pub struct SqlStatement {
    pub sql: String,
    #[serde(default)]
    pub params: Vec<serde_json::Value>,
}

type BoundQuery<'q> = sqlx::query::Query<'q, sqlx::Sqlite, SqliteArguments<'q>>;

#[tauri::command]
pub async fn run_sql_transaction(
    app: tauri::AppHandle,
    statements: Vec<SqlStatement>,
) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Cannot resolve app config dir: {e}"))?;
    let db_path = data_dir.join("cove.db");

    let mut conn = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(false)
        .journal_mode(SqliteJournalMode::Wal)
        .foreign_keys(true)
        .connect()
        .await
        .map_err(|e| format!("Cannot open database for transaction: {e}"))?;

    let mut tx = conn.begin().await.map_err(|e| format!("BEGIN failed: {e}"))?;

    for (idx, stmt) in statements.iter().enumerate() {
        let mut query = sqlx::query(&stmt.sql);
        for param in &stmt.params {
            query = bind_json(query, param)?;
        }
        query
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Statement #{} failed (`{}`): {}", idx + 1, stmt.sql, e))?;
    }

    tx.commit().await.map_err(|e| format!("COMMIT failed: {e}"))?;
    conn.close().await.ok();
    Ok(())
}

fn bind_json<'q>(query: BoundQuery<'q>, value: &serde_json::Value) -> Result<BoundQuery<'q>, String> {
    Ok(match value {
        serde_json::Value::Null => query.bind(None::<i64>),
        serde_json::Value::Bool(b) => query.bind(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                query.bind(i)
            } else if let Some(f) = n.as_f64() {
                query.bind(f)
            } else {
                return Err(format!("Unsupported numeric parameter: {n}"));
            }
        }
        serde_json::Value::String(s) => query.bind(s.clone()),
        other => return Err(format!("Unsupported parameter type: {other}")),
    })
}
