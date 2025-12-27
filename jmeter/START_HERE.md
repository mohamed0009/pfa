# 🚀 START HERE - Quick Start Guide

## Step 1: Start Your Backend

Open a new terminal and run:

```powershell
cd backend
mvn spring-boot:run
```

Wait until you see: `Started CoachAiApplication in X.XXX seconds`

## Step 2: Run JMeter Tests

### Option A: Automated Script (Recommended)

```powershell
cd jmeter
.\run-jmeter-tests.ps1
```

This will:
- ✅ Check if backend is running
- ✅ Run all test scenarios
- ✅ Generate HTML report
- ✅ Open results in browser

### Option B: JMeter GUI

```powershell
# Open JMeter
jmeter

# Then:
# 1. File → Open → jmeter\Coach_AI_Test_Plan.jmx
# 2. Click Start button (green play icon)
# 3. View results in "View Results Tree" and "Summary Report"
```

### Option C: Command Line (Non-GUI)

```powershell
cd jmeter
jmeter -n -t Coach_AI_Test_Plan.jmx -l results.jtl -e -o report/
```

Then open `report/index.html` in your browser.

## Step 3: View Results

After tests complete:
- **HTML Report**: `jmeter-results\[timestamp]\html-report\index.html`
- **JTL File**: `jmeter-results\[timestamp]\results.jtl`

## What Gets Tested

✅ **Authentication**
- Login API
- Signup API

✅ **Public APIs**
- Get formations
- Get formation details

✅ **User APIs** (with authentication)
- Get profile
- Get courses

## Test Configuration

Default settings:
- **Base URL**: `http://localhost:8081`
- **Test User**: `test@etud.com` / `password123`
- **Concurrent Users**: 5-20 (varies by test)
- **Duration**: ~1-2 minutes

## Need Help?

See [README.md](README.md) for detailed documentation.

