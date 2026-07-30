/// DPAPI blobs unwrap only on the same machine + user account (per-SID OS key);
/// non-Windows returns an error rather than a weaker fallback.

#[cfg(target_os = "windows")]
mod platform {
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Cryptography::{
        CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB as Blob, CryptProtectData, CryptUnprotectData,
    };

    // App-bound entropy. DPAPI's default binding is per-user-account (per-SID),
    // not per-application, so without entropy any process running as the same
    // user could unwrap a cove escrow blob and recover the DEK without the
    // passphrase. Binding the blob to this constant means only cove can unwrap it.
    // Must stay byte-identical across versions that must read each other's blobs.
    const APP_ENTROPY: &[u8] = b"cove-notes::device-bind::v1";

    fn wrap_blob(data: &[u8]) -> Blob {
        Blob {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        }
    }

    fn free_blob(blob: &Blob) {
        if !blob.pbData.is_null() {
            unsafe { LocalFree(blob.pbData as *mut core::ffi::c_void) };
        }
    }

    pub fn protect(plaintext: &[u8]) -> Result<Vec<u8>, String> {
        unsafe {
            let input = wrap_blob(plaintext);
            let entropy = wrap_blob(APP_ENTROPY);
            let mut output = Blob { cbData: 0, pbData: std::ptr::null_mut() };
            let ok = CryptProtectData(
                &input,
                std::ptr::null(),
                &entropy,
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            );
            if ok == 0 {
                return Err(format!(
                    "CryptProtectData failed: {}",
                    std::io::Error::last_os_error()
                ));
            }
            let result =
                std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
            free_blob(&output);
            Ok(result)
        }
    }

    pub fn unprotect(ciphertext: &[u8]) -> Result<Vec<u8>, String> {
        // Prefer the app-bound entropy; fall back to no-entropy so blobs minted by
        // older builds (before entropy was added) still unwrap for a smooth upgrade.
        match unprotect_with(ciphertext, true) {
            Ok(pt) => Ok(pt),
            Err(_) => unprotect_with(ciphertext, false),
        }
    }

    fn unprotect_with(ciphertext: &[u8], with_entropy: bool) -> Result<Vec<u8>, String> {
        unsafe {
            let input = wrap_blob(ciphertext);
            let entropy = wrap_blob(APP_ENTROPY);
            let entropy_arg: *const Blob = if with_entropy {
                &entropy
            } else {
                std::ptr::null()
            };
            let mut output = Blob { cbData: 0, pbData: std::ptr::null_mut() };
            let ok = CryptUnprotectData(
                &input,
                std::ptr::null_mut(),
                entropy_arg,
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            );
            if ok == 0 {
                return Err(format!(
                    "CryptUnprotectData failed: {}",
                    std::io::Error::last_os_error()
                ));
            }
            let result =
                std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
            free_blob(&output);
            Ok(result)
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    pub fn protect(_: &[u8]) -> Result<Vec<u8>, String> {
        Err("Device-bound recovery is not supported on this OS (Windows DPAPI only).".into())
    }
    pub fn unprotect(_: &[u8]) -> Result<Vec<u8>, String> {
        Err("Device-bound recovery is not supported on this OS (Windows DPAPI only).".into())
    }
}

#[tauri::command]
pub fn device_wrap(plaintext: Vec<u8>) -> Result<Vec<u8>, String> {
    platform::protect(&plaintext)
}

#[tauri::command]
pub fn device_unwrap(ciphertext: Vec<u8>) -> Result<Vec<u8>, String> {
    platform::unprotect(&ciphertext)
}
