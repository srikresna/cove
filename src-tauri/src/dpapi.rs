
#[cfg(target_os = "windows")]
mod platform {
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Cryptography::{
        CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB as Blob, CryptProtectData, CryptUnprotectData,
    };

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
        unprotect_with(ciphertext, true)
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
