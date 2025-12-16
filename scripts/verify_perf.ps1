$urls = @(
    @{ Name = "Main Domain"; Url = "https://flight-deal-finder.vercel.app/api/search?origin=LIS&destination=LHR&date=2025-05-20" },
    @{ Name = "Fresh Deploy URL"; Url = "https://flight-deal-finder-bgfqoi3xh-lirachefs-6918s-projects.vercel.app/api/search?origin=LIS&destination=LHR&date=2025-05-20" }
)

Write-Host "Comparing Domains..." -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan

foreach ($item in $urls) {
    Start-Sleep -Milliseconds 500
    try {
        $r = Invoke-WebRequest $item.Url -Method Head -UseBasicParsing
        $status = $r.StatusCode
        $cache = $r.Headers['X-Vercel-Cache']
        $control = $r.Headers['Cache-Control']
        $fallback = $r.Headers['X-Fallback-Active']
        
        Write-Host "$($item.Name):" -ForegroundColor Yellow
        Write-Host "  URL: $($item.Url)" -ForegroundColor Gray
        Write-Host "  Control: $control" -ForegroundColor White
        if ($fallback) { Write-Host "  Fallback: $fallback" -ForegroundColor Magenta }
        if ($cache -eq "HIT") { Write-Host "  Cache: HIT" -ForegroundColor Green } else { Write-Host "  Cache: MISS" -ForegroundColor Red }
        Write-Host ""
    }
    catch {
        Write-Host "$($item.Name): Failed - $_" -ForegroundColor Red
    }
}
