$env:PGPASSWORD='ADMIN'

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Coach AI - Database Seed Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Connecting to PostgreSQL database..." -ForegroundColor Yellow

# Execute the seed script
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d coach_ai_db -f "database\seed_data.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Database seeded successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test Users Created:" -ForegroundColor Cyan
    Write-Host "  Admin:    admin@coachai.com / test123" -ForegroundColor White
    Write-Host "  Trainer:  trainer1@coachai.com / test123" -ForegroundColor White
    Write-Host "  User:     user1@example.com / test123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  Error seeding database!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
}
