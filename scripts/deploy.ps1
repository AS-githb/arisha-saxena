$ErrorActionPreference = 'Stop'
# Get token from environment variable: $env:VERCEL_TOKEN
$VERCEL_TOKEN = $env:VERCEL_TOKEN
if (-not $VERCEL_TOKEN) {
  Write-Host "Error: VERCEL_TOKEN environment variable not set"
  exit 1
}
$TEAM_ID      = 'team_XIjPoNSxOWUtBtGa4YBylhpq'
$PROJECT_NAME = 'arisha.saxena'
$ROOT = 'c:/Users/pc/Documents/Github/Website'

$files = @(
    @{ local="$ROOT/index.html";         remote='index.html' },
    @{ local="$ROOT/explorea/index.html"; remote='explorea/index.html' },
    @{ local="$ROOT/api/content.js";     remote='api/content.js' },
    @{ local="$ROOT/api/submit-note.js"; remote='api/submit-note.js' },
    @{ local="$ROOT/vercel.json";        remote='vercel.json' },
    @{ local="$ROOT/package.json";       remote='package.json' }
)

$sha1 = [System.Security.Cryptography.SHA1]::Create()
$fileRefs = @()

Write-Host "Uploading files..."
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.local)
    $hashBytes = $sha1.ComputeHash($bytes)
    $hash = ($hashBytes | ForEach-Object { $_.ToString('x2') }) -join ''
    $uploadH = @{
        'Authorization' = "Bearer $VERCEL_TOKEN"
        'Content-Type'  = 'application/octet-stream'
        'x-now-digest'  = $hash
        'x-now-size'    = $bytes.Length.ToString()
    }
    try {
        Invoke-RestMethod -Uri 'https://api.vercel.com/v2/files' -Method Post -Headers $uploadH -Body $bytes | Out-Null
        Write-Host "  Uploaded: $($f.remote)"
    } catch {
        if ($_ -match '409') { Write-Host "  Cached:   $($f.remote)" }
        else { Write-Host "  Warn: $($f.remote): $_" }
    }
    $fileRefs += @{ file=$f.remote; sha=$hash; size=$bytes.Length }
}

$deployBody = @{
    name   = $PROJECT_NAME
    files  = $fileRefs
    projectSettings = @{ framework=$null }
    target = 'production'
} | ConvertTo-Json -Depth 10

$H2 = @{ 'Authorization' = "Bearer $VERCEL_TOKEN"; 'Content-Type' = 'application/json' }
Write-Host "`nCreating deployment..."
$deploy = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments?forceNew=1&teamId=$TEAM_ID" -Method Post -Headers $H2 -Body $deployBody
Write-Host "Deployment: $($deploy.id) -- $($deploy.readyState)"

for ($i = 0; $i -lt 18; $i++) {
    Start-Sleep -Seconds 10
    $d = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$($deploy.id)?teamId=$TEAM_ID" -Headers $H2
    Write-Host "  $($d.readyState)"
    if ($d.readyState -in @('READY','ERROR','CANCELED')) { break }
}
Write-Host "`nDone: https://arishasaxena.vercel.app"
