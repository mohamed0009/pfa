$env:PGPASSWORD='ADMIN'
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres coach_ai_db
Write-Host "Database coach_ai_db created successfully!"
