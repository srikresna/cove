use base64::Engine as _;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use url::Url;

#[derive(Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct LinkPreviewData {
    pub title: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub image: Option<String>,
}

const MAX_HTML_BYTES: u64 = 768 * 1024;
const MAX_IMAGE_BYTES: u64 = 256 * 1024;
const MAX_ICON_BYTES: u64 = 64 * 1024;

fn client() -> reqwest::Client {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoveNotes/0.1")
        .timeout(Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::limited(8))
        .build()
        .expect("reqwest client")
}

fn decode_entities(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let bytes = input.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'&' {
            if let Some(end) = input[i..].find(';').map(|n| i + n) {
                let entity = &input[i + 1..end];
                let replacement = match entity {
                    "amp" => Some('&'),
                    "lt" => Some('<'),
                    "gt" => Some('>'),
                    "quot" => Some('"'),
                    "apos" | "#39" | "#x27" | "#039" => Some('\''),
                    "nbsp" => Some(' '),
                    _ => {
                        if let Some(code) = entity
                            .strip_prefix("#x")
                            .and_then(|h| u32::from_str_radix(h, 16).ok())
                            .or_else(|| entity.strip_prefix('#').and_then(|d| d.parse::<u32>().ok()))
                        {
                            char::from_u32(code)
                        } else {
                            None
                        }
                    }
                };
                if let Some(ch) = replacement {
                    out.push(ch);
                    i = end + 1;
                    continue;
                }
            }
        }
        let ch = input[i..].chars().next().expect("in-bounds char");
        out.push(ch);
        i += ch.len_utf8();
    }
    out
}

fn attr_value(tag: &str, name: &str) -> Option<String> {
    let mut rest = tag;
    while let Some(pos) = rest.find(name) {
        let before = rest[..pos].chars().next_back();
        let after_eq = rest[pos + name.len()..].trim_start();
        let boundary = before
            .map(|c| c.is_whitespace() || c == '<')
            .unwrap_or(true)
            && after_eq.starts_with('=');
        if !boundary {
            rest = &rest[pos + name.len()..];
            continue;
        }
        let value_part = after_eq[1..].trim_start();
        let quoted = value_part
            .strip_prefix('"')
            .or_else(|| value_part.strip_prefix('\''));
        if let Some(q) = quoted {
            let end = q.find(['"', '\''])?;
            return Some(q[..end].to_string());
        }
        let end = value_part.find(char::is_whitespace).unwrap_or(value_part.len());
        return Some(value_part[..end].to_string());
    }
    None
}

fn first_meta(html: &str, wanted: &[&str]) -> Option<String> {
    let lower = html.to_ascii_lowercase();
    let mut cursor = 0usize;
    while let Some(start) = lower[cursor..].find("<meta") {
        let abs_start = cursor + start;
        let end = lower[abs_start..].find('>')? + abs_start;
        let tag = &html[abs_start..=end];
        let key = attr_value(tag, "property")
            .or_else(|| attr_value(tag, "name"))
            .map(|k| k.to_ascii_lowercase());
        if let Some(key) = key {
            if wanted.contains(&key.as_str()) {
                if let Some(content) = attr_value(tag, "content") {
                    let decoded = decode_entities(&content);
                    if !decoded.trim().is_empty() {
                        return Some(decoded.trim().to_string());
                    }
                }
            }
        }
        cursor = end + 1;
    }
    None
}

fn page_title(html: &str) -> Option<String> {
    let lower = html.to_ascii_lowercase();
    let start = lower.find("<title")?;
    let open_end = lower[start..].find('>')? + start;
    let close = lower[open_end..].find("</title")? + open_end;
    let title = decode_entities(html[open_end + 1..close].trim());
    if title.is_empty() {
        None
    } else {
        Some(title)
    }
}

fn link_icon(html: &str) -> Option<String> {
    let lower = html.to_ascii_lowercase();
    let mut cursor = 0usize;
    while let Some(start) = lower[cursor..].find("<link") {
        let abs_start = cursor + start;
        let Some(rel_end) = lower[abs_start..].find('>') else {
            return None;
        };
        let end = rel_end + abs_start;
        let tag = &html[abs_start..=end];
        let rel = match attr_value(tag, "rel") {
            Some(rel) => rel.to_ascii_lowercase(),
            None => {
                cursor = end + 1;
                continue;
            }
        };
        if rel.contains("icon") {
            if let Some(href) = attr_value(tag, "href") {
                if !href.trim().is_empty() {
                    return Some(href);
                }
            }
        }
        cursor = end + 1;
    }
    None
}

fn absolutize(base: &Url, href: &str) -> Option<Url> {
    if href.starts_with("data:") {
        return None;
    }
    base.join(href).ok()
}

async fn read_capped(
    mut response: reqwest::Response,
    cap: u64,
) -> Result<Vec<u8>, String> {
    let mut buf: Vec<u8> = Vec::new();
    let mut total: u64 = 0;
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|e| format!("read failed: {e}"))?
    {
        total += chunk.len() as u64;
        if total > cap {
            break;
        }
        buf.extend_from_slice(&chunk);
    }
    Ok(buf)
}

async fn fetch_data_url(client: &reqwest::Client, resolved: &Url, cap: u64) -> Option<String> {
    let response = client.get(resolved.clone()).send().await.ok()?;
    if !response.status().is_success() {
        return None;
    }
    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/png")
        .split(';')
        .next()
        .unwrap_or("image/png")
        .trim()
        .to_string();
    if !content_type.starts_with("image/") {
        return None;
    }
    let bytes = read_capped(response, cap).await.ok()?;
    if bytes.is_empty() {
        return None;
    }
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{};base64,{}", content_type, encoded))
}

fn parse_preview(html: &str) -> (Option<String>, Option<String>, Option<String>, Option<String>) {
    let title = first_meta(html, &["og:title", "twitter:title"]).or_else(|| page_title(html));
    let description = first_meta(html, &["og:description", "twitter:description", "description"]);
    let image_href = first_meta(html, &["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]);
    let icon_href = link_icon(html).or_else(|| first_meta(html, &["msapplication-tileimage"]));
    (title, description, icon_href, image_href)
}

#[tauri::command]
pub async fn fetch_link_preview(url: String) -> Result<LinkPreviewData, String> {
    let parsed = Url::parse(&url).map_err(|_| format!("invalid url: {url}"))?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(format!("unsupported scheme: {}", parsed.scheme()));
    }
    let client = client();

    let response = client
        .get(parsed.clone())
        .header(reqwest::header::ACCEPT, "text/html,application/xhtml+xml")
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;
    if !response.status().is_success() {
        return Err(format!("http {}", response.status()));
    }
    let final_url = response.url().clone();
    let body_bytes = read_capped(response, MAX_HTML_BYTES).await?;
    let body = String::from_utf8_lossy(&body_bytes).to_string();

    let (title, description, icon_href, image_href) = parse_preview(&body);
    let icon = match icon_href.as_deref().and_then(|h| absolutize(&final_url, h)) {
        Some(resolved) => fetch_data_url(&client, &resolved, MAX_ICON_BYTES).await,
        None => None,
    };
    let image = match image_href.as_deref().and_then(|h| absolutize(&final_url, h)) {
        Some(resolved) => fetch_data_url(&client, &resolved, MAX_IMAGE_BYTES).await,
        None => None,
    };

    Ok(LinkPreviewData {
        title,
        description,
        icon,
        image,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base() -> Url {
        Url::parse("https://example.com/posts/hello").unwrap()
    }

    #[test]
    fn parses_open_graph_in_any_attribute_order() {
        let html = r#"<html><head>
            <meta content="Hello World" property="og:title">
            <meta property="og:description" content="A &amp; B &#x2014; done">
            <meta name="twitter:image" content="/img/cover.png">
            <link rel="shortcut icon" href="/favicon.ico">
            <title>Fallback</title>
            </head><body></body></html>"#;
        let (title, description, icon, image) = parse_preview(html);
        assert_eq!(title.as_deref(), Some("Hello World"));
        assert_eq!(description.as_deref(), Some("A & B — done"));
        assert_eq!(icon.as_deref(), Some("/favicon.ico"));
        assert_eq!(image.as_deref(), Some("/img/cover.png"));
    }

    #[test]
    fn falls_back_to_title_tag_and_meta_description() {
        let html = r#"<html><head><title>  Plain Page </title>
            <meta name="description" content="desc here">
            </head></html>"#;
        let (title, description, _icon, _image) = parse_preview(html);
        assert_eq!(title.as_deref(), Some("Plain Page"));
        assert_eq!(description.as_deref(), Some("desc here"));
    }

    #[test]
    fn decodes_named_and_numeric_entities() {
        assert_eq!(decode_entities("a &lt;b&gt; &#65; &#x42; &quot;q&quot; &unknown;"), "a <b> A B \"q\" &unknown;");
    }

    #[test]
    fn data_urls_are_not_absolutized() {
        assert!(absolutize(&base(), "data:image/png;base64,AAAA").is_none());
        assert_eq!(
            absolutize(&base(), "/x.png").unwrap().as_str(),
            "https://example.com/x.png"
        );
    }

    #[test]
    fn rejects_data_image_hrefs() {
        assert!(absolutize(&base(), "data:image/png;base64,AAAA").is_none());
    }
}
