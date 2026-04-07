$envFile = Get-Content "$PSScriptRoot\..\.env" -Encoding UTF8
$token = ($envFile | Where-Object { $_ -match '^NOTION_TOKEN=' }) -replace '^NOTION_TOKEN=', ''
$dbId  = ($envFile | Where-Object { $_ -match '^NOTION_DB_NOTES=' }) -replace '^NOTION_DB_NOTES=', ''

$headers = @{
  'Authorization'  = "Bearer $token"
  'Notion-Version' = '2022-06-28'
  'Content-Type'   = 'application/json'
}

$body = '{"properties":{"Approved":{"checkbox":{}}}}'

Write-Host "Adding Approved checkbox to Hype Squad Notes DB ($dbId)..."
$resp = Invoke-RestMethod -Uri "https://api.notion.com/v1/databases/$dbId" -Method Patch -Headers $headers -Body $body
Write-Host "Done! Approved property added."
