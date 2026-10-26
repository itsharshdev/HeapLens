# HeapLens Windows PowerShell Build & Test Script

param(
    [switch]$TestOnly,
    [switch]$Interactive
)

Write-Host "=== HeapLens Phase 1 Build & Test Runner ===" -ForegroundColor Cyan

if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

if (-not $TestOnly) {
    Write-Host "[1/3] Compiling C++ Allocator Engine..." -ForegroundColor Yellow
    g++ -std=c++17 -Wall -Wextra src/allocator.cpp src/main.cpp -o build/heaplens_engine.exe
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Engine compilation failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "Engine compiled -> build/heaplens_engine.exe" -ForegroundColor Green

    Write-Host "[2/3] Compiling C++ Unit Test Suite..." -ForegroundColor Yellow
    g++ -std=c++17 -Wall -Wextra src/allocator.cpp tests/test_allocator.cpp -o build/test_allocator.exe
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Unit test compilation failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "Tests compiled -> build/test_allocator.exe" -ForegroundColor Green
}

if ($Interactive) {
    Write-Host "Launching Interactive Allocator REPL..." -ForegroundColor Cyan
    .\build\heaplens_engine.exe --interactive
    exit 0
}

Write-Host "`n[3/3] Running Automated C++ Unit Tests..." -ForegroundColor Yellow
.\build\test_allocator.exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "Unit tests failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[4/4] Running End-to-End Integration Proof..." -ForegroundColor Yellow
node tests/test_integration.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Integration proof failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n>>> ALL PHASE 1 CHECKS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green
