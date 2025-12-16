$urls = @(
    @{ Name = "Locations (Warmup)"; Url = "https://flight-deal-finder.vercel.app/api/locations?keyword=Lon" },
    @{ Name = "Locations (Hit)"; Url = "https://flight-deal-finder.vercel.app/api/locations?keyword=Lon" },
    @{ Name = "Search (Live)"; Url = "https://flight-deal-finder.vercel.app/api/search?origin=LIS&destination=LHR&date=2025-05-20" }
)

Write-Host "Starting Performance Verification..." -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan

foreach ($item in $urls) {
    Start-Sleep -Milliseconds 500
    try {
        $time = Measure-Command {
            $resp = Invoke-WebRequest $item.Url -Method Head -UseBasicParsing
        }
        $status = $resp.StatusCode
        $cache = $resp.Headers['X-Vercel-Cache']
        $control = $resp.Headers['Cache-Control']
        $t = [math]::Round($time.TotalMilliseconds, 0)
        
        Write-Host "$($item.Name):" -NoNewline -ForegroundColor Yellow
        Write-Host " ${t}ms" -NoNewline -ForegroundColor Green
        Write-Host " | Status: $status" -NoNewline
        Write-Host " | Cache: " -NoNewline
        if ($cache -eq "HIT") { Write-Host $cache -ForegroundColor Green -NoNewline } else { Write-Host $cache -ForegroundColor Red -NoNewline }
        Write-Host " | Control: $control"
    }
    catch {
        Write-Host "$($item.Name): Failed - $_" -ForegroundColor Red
    }
}
Write-Host "-------------------------------------" -ForegroundColor Cyan
