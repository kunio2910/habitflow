[CmdletBinding()]
param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$safeDirectory = $repoRoot.Replace("\", "/")
$gitConfig = @("-c", "safe.directory=$safeDirectory")

Push-Location $repoRoot

try {
  $remoteUrl = & git @gitConfig remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $remoteUrl) {
    throw "Chưa cấu hình GitHub remote 'origin'."
  }

  & git @gitConfig add -A
  if ($LASTEXITCODE -ne 0) {
    throw "Không thể chuẩn bị các file thay đổi."
  }

  $stagedFiles = @(& git @gitConfig diff --cached --name-only)
  $sensitiveFiles = @(
    $stagedFiles | Where-Object {
      $_ -match '(^|/)\.env($|\.)' -or
      $_ -match 'service[-_]?account.*\.json$' -or
      $_ -match 'habitflow-\d+-[a-z0-9]+\.json$'
    }
  )

  if ($sensitiveFiles.Count -gt 0) {
    & git @gitConfig restore --staged -- $sensitiveFiles
    throw "Đã chặn file nhạy cảm: $($sensitiveFiles -join ', ')"
  }

  & git @gitConfig diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Không có thay đổi mới để upload."
    exit 0
  }

  if (-not $Message.Trim()) {
    $Message = "Auto upload $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }

  & git @gitConfig commit -m $Message
  if ($LASTEXITCODE -ne 0) {
    throw "Không thể tạo commit."
  }

  & git @gitConfig push origin main
  if ($LASTEXITCODE -ne 0) {
    throw "Không thể upload lên GitHub."
  }

  Write-Host "Đã upload thành công lên $remoteUrl"
}
finally {
  Pop-Location
}
