use base64::Engine as _;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::Duration;

const AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const API_BASE: &str = "https://www.googleapis.com/calendar/v3";
pub const GCAL_SCOPE: &str = "https://www.googleapis.com/auth/calendar.events";

const CONSENT_TIMEOUT_SECS: u64 = 300;
const MAX_RESPONSE_BYTES: usize = 4 * 1024 * 1024;
const MAX_EVENT_PAGES: usize = 10;
const CONNECT_SUCCESS_PAGE: &str = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Cove</title></head><body style=\"font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0\"><div style=\"text-align:center\"><h2>Google Calendar connected</h2><p>You can close this tab and return to Cove.</p></div></body></html>";

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GcalTokens {
    pub refresh_token: String,
    pub access_token: String,
    pub expires_at_ms: u64,
    pub scope: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GcalAccessToken {
    pub access_token: String,
    pub expires_at_ms: u64,
    pub scope: String,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GcalEventDateTime {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date_time: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GcalExtendedProperties {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub private: Option<HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GcalEvent {
    pub id: String,
    #[serde(default)]
    pub summary: Option<String>,
    #[serde(default)]
    pub start: GcalEventDateTime,
    #[serde(default)]
    pub end: GcalEventDateTime,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hangout_link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub event_type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html_link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extended_properties: Option<GcalExtendedProperties>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GcalEventInput {
    pub id: String,
    pub summary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub start: GcalEventDateTime,
    pub end: GcalEventDateTime,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extended_properties: Option<GcalExtendedProperties>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GcalCalendar {
    pub id: String,
    pub summary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub foreground_color: Option<String>,
    #[serde(default)]
    pub primary: bool,
}

fn client() -> reqwest::Client {
    reqwest::Client::builder()
        .user_agent("CoveNotes/0.1")
        .timeout(Duration::from_secs(15))
        .build()
        .expect("reqwest client")
}

fn random_urlsafe(bytes: usize) -> Result<String, String> {
    let mut buf = vec![0u8; bytes];
    getrandom::fill(&mut buf).map_err(|e| format!("random: {e}"))?;
    Ok(base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(buf))
}

fn pkce_pair() -> Result<(String, String), String> {
    let verifier = random_urlsafe(48)?;
    let challenge = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .encode(Sha256::digest(verifier.as_bytes()));
    Ok((verifier, challenge))
}

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn query_encode(pairs: &[(&str, &str)]) -> String {
    pairs
        .iter()
        .map(|(k, v)| format!("{k}={}", urlencoding_escape(v)))
        .collect::<Vec<_>>()
        .join("&")
}

fn urlencoding_escape(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for byte in input.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(byte as char)
            }
            _ => out.push_str(&format!("%{byte:02X}")),
        }
    }
    out
}

#[derive(Debug, Deserialize)]
struct TokenResponse {
    access_token: String,
    #[serde(default)]
    refresh_token: Option<String>,
    #[serde(default)]
    expires_in: Option<u64>,
    #[serde(default)]
    scope: Option<String>,
}

async fn exchange_token(body: String) -> Result<TokenResponse, String> {
    let resp = client()
        .post(TOKEN_URL)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body)
        .send()
        .await
        .map_err(|e| format!("token request failed: {e}"))?;
    let status = resp.status();
    let text = capped_text(resp).await?;
    if !status.is_success() {
        return Err(format!("token endpoint returned {status}: {text}"));
    }
    serde_json::from_str::<TokenResponse>(&text).map_err(|e| format!("token response parse: {e}"))
}

async fn capped_text(resp: reqwest::Response) -> Result<String, String> {
    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("read response: {e}"))?;
    if bytes.len() > MAX_RESPONSE_BYTES {
        return Err(format!("response too large ({} bytes)", bytes.len()));
    }
    String::from_utf8(bytes.into()).map_err(|e| format!("response encoding: {e}"))
}

struct LoopbackCode {
    code: String,
}

fn read_request_line(stream: &mut TcpStream) -> Option<String> {
    let mut buf = [0u8; 4096];
    let mut read = 0usize;
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .ok()?;
    while read < buf.len() {
        match stream.read(&mut buf[read..]) {
            Ok(0) => break,
            Ok(n) => {
                read += n;
                let window = &buf[..read];
                if window.windows(4).any(|w| w == b"\r\n\r\n")
                    || window.windows(2).any(|w| w == b"\n\n")
                {
                    break;
                }
            }
            Err(_) => break,
        }
    }
    let text = String::from_utf8_lossy(&buf[..read]);
    text.lines().next().map(|l| l.to_string())
}

fn query_param(request_line: &str, key: &str) -> Option<String> {
    let query = request_line.split_once('?')?.1.split_whitespace().next()?;
    for pair in query.split('&') {
        let (k, v) = pair.split_once('=')?;
        if k == key {
            return Some(percent_decode(v));
        }
    }
    None
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(byte) = u8::from_str_radix(&input[i + 1..i + 3], 16) {
                out.push(byte);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn wait_for_redirect(listener: TcpListener, expected_state: &str) -> Result<LoopbackCode, String> {
    let deadline = std::time::Instant::now() + Duration::from_secs(CONSENT_TIMEOUT_SECS);
    listener
        .set_nonblocking(true)
        .map_err(|e| format!("listener: {e}"))?;
    loop {
        if std::time::Instant::now() > deadline {
            return Err("Timed out waiting for Google sign-in in the browser".into());
        }
        match listener.accept() {
            Ok((mut stream, _)) => {
                stream
                    .set_nodelay(true)
                    .and_then(|_| stream.set_write_timeout(Some(Duration::from_secs(5))))
                    .ok();
                let Some(request_line) = read_request_line(&mut stream) else {
                    continue;
                };
                let page = if query_param(&request_line, "state").as_deref() == Some(expected_state)
                    && query_param(&request_line, "code").is_some()
                {
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n".to_string() + CONNECT_SUCCESS_PAGE
                } else {
                    "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n".to_string() + "<html><body><p>Invalid sign-in response. Please try connecting again from Cove.</p></body></html>"
                };
                let _ = stream.write_all(page.as_bytes());
                let _ = stream.flush();
                let _ = stream.shutdown(std::net::Shutdown::Both);

                if let Some(error) = query_param(&request_line, "error") {
                    return Err(format!("Google returned an error: {error}"));
                }
                let Some(state) = query_param(&request_line, "state") else {
                    return Err("Missing state in sign-in response".into());
                };
                if state != expected_state {
                    return Err(
                        "Sign-in state mismatch — possible interference. Please retry.".into(),
                    );
                }
                let Some(code) = query_param(&request_line, "code") else {
                    return Err("No authorization code in sign-in response".into());
                };
                return Ok(LoopbackCode { code });
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                std::thread::sleep(Duration::from_millis(150));
            }
            Err(e) => return Err(format!("listener: {e}")),
        }
    }
}

#[tauri::command]
pub async fn gcal_connect(client_id: String, client_secret: String) -> Result<GcalTokens, String> {
    if client_id.trim().is_empty() || client_secret.trim().is_empty() {
        return Err(
            "Google OAuth client ID and secret are required. Copy both from Google Cloud Console into Settings > Connections.".into(),
        );
    }
    let (verifier, challenge) = pkce_pair()?;
    let state = random_urlsafe(24)?;
    let listener =
        TcpListener::bind("127.0.0.1:0").map_err(|e| format!("bind loopback listener: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("listener port: {e}"))?
        .port();
    let redirect_uri = format!("http://127.0.0.1:{port}");
    let consent = format!(
        "{AUTH_URL}?{}",
        query_encode(&[
            ("client_id", client_id.trim()),
            ("redirect_uri", &redirect_uri),
            ("response_type", "code"),
            ("scope", GCAL_SCOPE),
            ("access_type", "offline"),
            ("prompt", "consent"),
            ("state", &state),
            ("code_challenge", &challenge),
            ("code_challenge_method", "S256"),
        ])
    );
    tauri_plugin_opener::open_url(consent.clone(), None::<&str>)
        .map_err(|e| format!("open browser: {e}"))?;

    let wait_state = state.clone();
    let code =
        tauri::async_runtime::spawn_blocking(move || wait_for_redirect(listener, &wait_state))
            .await
            .map_err(|e| format!("sign-in wait: {e}"))??;

    let body = query_encode(&[
        ("client_id", client_id.trim()),
        ("client_secret", client_secret.trim()),
        ("code", &code.code),
        ("code_verifier", &verifier),
        ("grant_type", "authorization_code"),
        ("redirect_uri", &redirect_uri),
    ]);
    let tokens = exchange_token(body).await?;
    let refresh_token = tokens.refresh_token.ok_or_else(|| {
        "Google did not return a refresh token. Revoke Cove at https://myaccount.google.com/permissions and connect again.".to_string()
    })?;
    Ok(GcalTokens {
        refresh_token,
        access_token: tokens.access_token,
        expires_at_ms: now_ms() + tokens.expires_in.unwrap_or(3600).saturating_sub(60) * 1000,
        scope: tokens.scope.unwrap_or_default(),
    })
}

#[tauri::command]
pub async fn gcal_refresh(
    client_id: String,
    client_secret: String,
    refresh_token: String,
) -> Result<GcalAccessToken, String> {
    let body = query_encode(&[
        ("client_id", client_id.trim()),
        ("client_secret", client_secret.trim()),
        ("grant_type", "refresh_token"),
        ("refresh_token", &refresh_token),
    ]);
    let tokens = exchange_token(body).await?;
    Ok(GcalAccessToken {
        access_token: tokens.access_token,
        expires_at_ms: now_ms() + tokens.expires_in.unwrap_or(3600).saturating_sub(60) * 1000,
        scope: tokens.scope.unwrap_or_default(),
    })
}

async fn api_get_json(access_token: &str, path: &str) -> Result<serde_json::Value, String> {
    let url = format!("{API_BASE}{path}");
    let resp = client()
        .get(&url)
        .header("Authorization", format!("Bearer {access_token}"))
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;
    let status = resp.status();
    let text = capped_text(resp).await?;
    if !status.is_success() {
        return Err(format!("Google API {status} on GET {path}: {text}"));
    }
    serde_json::from_str(&text).map_err(|e| format!("response parse: {e}"))
}

#[tauri::command]
pub async fn gcal_list_events(
    access_token: String,
    calendar_id: String,
    time_min: String,
    time_max: String,
) -> Result<Vec<GcalEvent>, String> {
    let mut events = Vec::new();
    let mut page_token: Option<String> = None;
    for _ in 0..MAX_EVENT_PAGES {
        let mut path = format!(
            "/calendars/{}/events?{}",
            urlencoding_escape(&calendar_id),
            query_encode(&[
                ("singleEvents", "true"),
                ("orderBy", "startTime"),
                ("maxResults", "250"),
                ("timeMin", &time_min),
                ("timeMax", &time_max),
            ])
        );
        if let Some(token) = &page_token {
            path.push_str(&format!("&pageToken={}", urlencoding_escape(token)));
        }
        let value = api_get_json(&access_token, &path).await?;
        if let Some(items) = value.get("items").and_then(|v| v.as_array()) {
            for item in items {
                if let Ok(event) = serde_json::from_value::<GcalEvent>(item.clone()) {
                    events.push(event);
                }
            }
        }
        page_token = value
            .get("nextPageToken")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
        if page_token.is_none() {
            break;
        }
    }
    Ok(events)
}

#[tauri::command]
pub async fn gcal_create_event(
    access_token: String,
    calendar_id: String,
    event: GcalEventInput,
) -> Result<GcalEvent, String> {
    let url = format!(
        "{API_BASE}/calendars/{}/events?sendUpdates=none",
        urlencoding_escape(&calendar_id)
    );
    let body = serde_json::to_string(&event).map_err(|e| format!("encode event: {e}"))?;
    let resp = client()
        .post(&url)
        .header("Authorization", format!("Bearer {access_token}"))
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;
    let status = resp.status();
    let text = capped_text(resp).await?;
    if !status.is_success() {
        return Err(format!("Google API {status} on create event: {text}"));
    }
    serde_json::from_str::<GcalEvent>(&text).map_err(|e| format!("response parse: {e}"))
}

#[tauri::command]
pub async fn gcal_delete_event(
    access_token: String,
    calendar_id: String,
    event_id: String,
) -> Result<(), String> {
    let url = format!(
        "{API_BASE}/calendars/{}/events/{}?sendUpdates=none",
        urlencoding_escape(&calendar_id),
        urlencoding_escape(&event_id)
    );
    let resp = client()
        .delete(&url)
        .header("Authorization", format!("Bearer {access_token}"))
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;
    let status = resp.status();
    if status.is_success() {
        return Ok(());
    }
    // 404/410 = the event is already gone on Google's side; treat as success.
    if status.as_u16() == 404 || status.as_u16() == 410 {
        return Ok(());
    }
    let text = capped_text(resp).await?;
    Err(format!("Google API {status} on delete event: {text}"))
}

#[tauri::command]
pub async fn gcal_list_calendars(access_token: String) -> Result<Vec<GcalCalendar>, String> {
    let value = api_get_json(&access_token, "/users/me/calendarList?minAccessRole=writer").await?;
    let mut calendars = Vec::new();
    if let Some(items) = value.get("items").and_then(|v| v.as_array()) {
        for item in items {
            if let Ok(calendar) = serde_json::from_value::<GcalCalendar>(item.clone()) {
                calendars.push(calendar);
            }
        }
    }
    Ok(calendars)
}

#[tauri::command]
pub async fn gcal_primary_calendar(access_token: String) -> Result<GcalCalendar, String> {
    let value = api_get_json(&access_token, "/calendars/primary").await?;
    serde_json::from_value::<GcalCalendar>(value).map_err(|e| format!("response parse: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_verifier_and_challenge_pair_up() {
        let (verifier, challenge) = pkce_pair().unwrap();
        assert!((43..=128).contains(&verifier.len()));
        let expected = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .encode(Sha256::digest(verifier.as_bytes()));
        assert_eq!(challenge, expected);
    }

    #[test]
    fn query_params_roundtrip_through_percent_decoding() {
        let line = "GET /?state=abc&code=4%2F0Ax&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events HTTP/1.1";
        assert_eq!(query_param(line, "state").as_deref(), Some("abc"));
        assert_eq!(query_param(line, "code").as_deref(), Some("4/0Ax"));
        assert_eq!(
            query_param(line, "scope").as_deref(),
            Some("https://www.googleapis.com/auth/calendar.events")
        );
    }

    #[test]
    fn query_encoding_encodes_reserved_characters() {
        assert_eq!(urlencoding_escape("a b/c"), "a%20b%2Fc");
        assert_eq!(query_encode(&[("k", "v w")]), "k=v%20w");
    }
}
