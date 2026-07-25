use serde_json::Value;

/// Derive a 32-byte key from a passphrase using the specified KDF (runs in Rust,
/// not the JS webview — GPU/ASIC-resistant Argon2id available here).
///
/// Supports:
/// - "PBKDF2-SHA256" with params {"iterations": 600000}  (existing vaults)
/// - "ARGON2ID"       with params {"m_cost": 65536, "t_cost": 3, "p_cost": 4}
///   (OWASP first-choice KDF; 64 MiB memory-hard)
#[tauri::command]
pub fn derive_key_kdf(
    passphrase: String,
    salt: Vec<u8>,
    kdf_alg: String,
    params: String,
) -> Result<Vec<u8>, String> {
    match kdf_alg.as_str() {
        "PBKDF2-SHA256" => {
            let p: Value = serde_json::from_str(&params).map_err(|e| e.to_string())?;
            let iterations = p["iterations"].as_u64().unwrap_or(600_000) as u32;
            let mut output = vec![0u8; 32];
            pbkdf2::pbkdf2_hmac::<sha2::Sha256>(passphrase.as_bytes(), &salt, iterations, &mut output);
            Ok(output)
        }
        "ARGON2ID" => {
            let p: Value = serde_json::from_str(&params).map_err(|e| e.to_string())?;
            let m_cost = p["m_cost"].as_u64().unwrap_or(65_536) as u32; // 64 MiB
            let t_cost = p["t_cost"].as_u64().unwrap_or(3) as u32;
            let p_cost = p["p_cost"].as_u64().unwrap_or(4) as u32;
            let argon_params =
                argon2::Params::new(m_cost, t_cost, p_cost, Some(32)).map_err(|e| e.to_string())?;
            let argon = argon2::Argon2::new(
                argon2::Algorithm::Argon2id,
                argon2::Version::V0x13,
                argon_params,
            );
            let mut output = vec![0u8; 32];
            argon
                .hash_password_into(passphrase.as_bytes(), &salt, &mut output)
                .map_err(|e| e.to_string())?;
            Ok(output)
        }
        _ => Err(format!("Unknown KDF algorithm: {}", kdf_alg)),
    }
}
