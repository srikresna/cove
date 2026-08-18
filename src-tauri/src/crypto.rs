use serde_json::Value;

const PBKDF2_MIN_ITERATIONS: u64 = 100_000;
const PBKDF2_MAX_ITERATIONS: u64 = 10_000_000;
const ARGON2_MIN_M_COST_KIB: u64 = 8 * 1024;
const ARGON2_MAX_M_COST_KIB: u64 = 1024 * 1024;
const ARGON2_MIN_T_COST: u64 = 1;
const ARGON2_MAX_T_COST: u64 = 10;
const ARGON2_MIN_P_COST: u64 = 1;
const ARGON2_MAX_P_COST: u64 = 8;

fn required_param(params: &Value, key: &str, min: u64, max: u64) -> Result<u32, String> {
    let v = params
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("KDF params missing or non-numeric field: {key}"))?;
    if v < min || v > max {
        return Err(format!(
            "KDF param {key}={v} outside allowed range [{min}, {max}]"
        ));
    }
    Ok(v as u32)
}

#[tauri::command]
pub async fn derive_key_kdf(
    passphrase: String,
    salt: Vec<u8>,
    kdf_alg: String,
    params: String,
) -> Result<Vec<u8>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        derive_key_kdf_blocking(passphrase, salt, kdf_alg, params)
    })
    .await
    .map_err(|e| format!("KDF task failed: {e}"))?
}

fn derive_key_kdf_blocking(
    passphrase: String,
    salt: Vec<u8>,
    kdf_alg: String,
    params: String,
) -> Result<Vec<u8>, String> {
    if salt.len() < 8 {
        return Err("KDF salt must be at least 8 bytes.".into());
    }
    let p: Value =
        serde_json::from_str(&params).map_err(|e| format!("Malformed KDF params JSON: {e}"))?;
    match kdf_alg.as_str() {
        "PBKDF2-SHA256" => {
            let iterations =
                required_param(&p, "iterations", PBKDF2_MIN_ITERATIONS, PBKDF2_MAX_ITERATIONS)?;
            let mut output = vec![0u8; 32];
            pbkdf2::pbkdf2_hmac::<sha2::Sha256>(
                passphrase.as_bytes(),
                &salt,
                iterations,
                &mut output,
            );
            Ok(output)
        }
        "ARGON2ID" => {
            let m_cost = required_param(&p, "m_cost", ARGON2_MIN_M_COST_KIB, ARGON2_MAX_M_COST_KIB)?;
            let t_cost = required_param(&p, "t_cost", ARGON2_MIN_T_COST, ARGON2_MAX_T_COST)?;
            let p_cost = required_param(&p, "p_cost", ARGON2_MIN_P_COST, ARGON2_MAX_P_COST)?;
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

#[cfg(test)]
mod tests {
    use super::*;

    const SALT: [u8; 16] = [7u8; 16];

    #[test]
    fn pbkdf2_is_deterministic_and_32_bytes() {
        let params = r#"{"iterations": 100000}"#;
        let a = derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "PBKDF2-SHA256".into(), params.into())
            .unwrap();
        let b = derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "PBKDF2-SHA256".into(), params.into())
            .unwrap();
        assert_eq!(a.len(), 32);
        assert_eq!(a, b);
    }

    #[test]
    fn argon2id_is_deterministic_and_differs_from_pbkdf2() {
        let params = r#"{"m_cost": 8192, "t_cost": 1, "p_cost": 1}"#;
        let a =
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "ARGON2ID".into(), params.into()).unwrap();
        let b =
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "ARGON2ID".into(), params.into()).unwrap();
        assert_eq!(a.len(), 32);
        assert_eq!(a, b);
        let pb = derive_key_kdf_blocking(
            "pw".into(),
            SALT.to_vec(),
            "PBKDF2-SHA256".into(),
            r#"{"iterations": 100000}"#.into(),
        )
        .unwrap();
        assert_ne!(a, pb);
    }

    #[tokio::test(flavor = "current_thread")]
    async fn async_command_wrapper_matches_blocking_impl() {
        let params = r#"{"iterations": 100000}"#;
        let via_command = derive_key_kdf(
            "pw".into(),
            SALT.to_vec(),
            "PBKDF2-SHA256".into(),
            params.into(),
        )
        .await
        .unwrap();
        let direct =
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "PBKDF2-SHA256".into(), params.into())
                .unwrap();
        assert_eq!(via_command, direct);
    }

    #[test]
    fn rejects_unknown_algorithm_and_malformed_json() {
        assert!(derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "MD5".into(), "{}".into()).is_err());
        assert!(
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "ARGON2ID".into(), "not json".into())
                .is_err()
        );
    }

    #[test]
    fn rejects_missing_and_out_of_range_params() {
        assert!(derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "ARGON2ID".into(), "{}".into()).is_err());
        assert!(
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "PBKDF2-SHA256".into(), "{}".into())
                .is_err()
        );
        let huge = r#"{"m_cost": 4294967295, "t_cost": 3, "p_cost": 4}"#;
        assert!(derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "ARGON2ID".into(), huge.into()).is_err());
        let tiny = r#"{"iterations": 1}"#;
        assert!(
            derive_key_kdf_blocking("pw".into(), SALT.to_vec(), "PBKDF2-SHA256".into(), tiny.into())
                .is_err()
        );
    }
}
