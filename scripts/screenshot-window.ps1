param(
  [Parameter(Mandatory = $true)][int64]$Hwnd,
  [string]$OutFile = "$env:TEMP\cove-window.png"
)
# Screenshots a specific window by hwnd. Find the hwnd first with
# list-windows.ps1 — Get-Process MainWindowHandle can point at the wrong
# window (e.g. the single-instance plugin's hidden 16x16 "sic" window).
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Shot {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
  public struct R { public int L, T, Rt, B; }
}
"@
$h = [IntPtr]$Hwnd
if ([Shot]::IsIconic($h)) {
  [void][Shot]::ShowWindow($h, 9) # SW_RESTORE
  Start-Sleep -Milliseconds 500
}
# ALT-key press/release works around the foreground lock so the target
# window is actually on top when we copy from the screen.
[Shot]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)
[void][Shot]::SetForegroundWindow($h)
[Shot]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)
Start-Sleep -Seconds 2
$r = New-Object Shot+R
[void][Shot]::GetWindowRect($h, [ref]$r)
$w = $r.Rt - $r.L; $ht = $r.B - $r.T
if ($w -le 0 -or $ht -le 0) { Write-Output "degenerate rect ${w}x${ht}"; exit 1 }
$bmp = New-Object System.Drawing.Bitmap($w, $ht)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.L, $r.T, 0, 0, $bmp.Size)
$bmp.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "saved ${w}x${ht} -> $OutFile"
