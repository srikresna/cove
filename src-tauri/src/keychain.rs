use keyring::Entry;

const SERVICE: &str = "com.cove.notes";

const ALLOWED_USERS: [&str; 3] = ["dek-backup", "legacy-dek-bridge", "iv-highwatermark"];

fn entry_for(user: &str) -> Result<Entry, String> {
    if !ALLOWED_USERS.contains(&user) {
        return Err(format!("Keychain entry not allowed: {user}"));
    }
    Entry::new(SERVICE, user).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn keychain_get(user: String) -> Result<Option<String>, String> {
    match entry_for(&user)?.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn keychain_set(user: String, value: String) -> Result<(), String> {
    entry_for(&user)?
        .set_password(&value)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn keychain_delete(user: String) -> Result<(), String> {
    match entry_for(&user)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_non_allowlisted_user() {
        assert!(entry_for("some-other-apps-credential").is_err());
    }

    #[test]
    fn accepts_allowlisted_users() {
        for user in ALLOWED_USERS {
            assert!(entry_for(user).is_ok());
        }
    }
}
