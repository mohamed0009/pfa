# 🚀 Quick Start Guide - JMeter Testing

## Installation

### Windows
```powershell
# Using Chocolatey
choco install jmeter

# Or download from:
# https://jmeter.apache.org/download_jmeter.cgi
```

### Mac
```bash
brew install jmeter
```

### Linux
```bash
sudo apt-get install jmeter
# Or download from Apache website
```

## Quick Test Run

### 1. Start Your Backend
```bash
cd backend
mvn spring-boot:run
# Or use your start script
```

### 2. Run JMeter Tests

**Option A: Using Script (Easiest)**
```powershell
# Windows
cd jmeter
.\run-jmeter-tests.ps1
```

```bash
# Linux/Mac
cd jmeter
chmod +x run-jmeter-tests.sh
./run-jmeter-tests.sh
```

**Option B: Using JMeter GUI**
```bash
# Open JMeter
jmeter

# Then:
# 1. File → Open → Select Coach_AI_Test_Plan.jmx
# 2. Click Start (green play button)
```

**Option C: Command Line (Non-GUI)**
```bash
cd jmeter
jmeter -n -t Coach_AI_Test_Plan.jmx -l results.jtl -e -o report/
```

## View Results

After running tests, open the HTML report:
- **Location**: `jmeter-results/[timestamp]/html-report/index.html`
- **Or**: Open `report/index.html` if using command line

## Test Scenarios Included

✅ **Authentication Tests**
- Login API
- Signup API

✅ **Public API Tests**
- Get all formations
- Get formation by ID

✅ **User API Tests (Authenticated)**
- Get user profile
- Get courses
- Get enrollments

## Configuration

Edit test parameters in JMeter GUI:
- **Thread Groups** → Number of Threads (users)
- **Thread Groups** → Ramp-up Period (seconds)
- **Test Plan** → User Defined Variables (BASE_URL, credentials)

## Expected Results

Good performance indicators:
- ✅ Average response time: < 200ms
- ✅ Error rate: < 1%
- ✅ Throughput: > 50 req/sec

## Troubleshooting

**Backend not running?**
```bash
cd backend
mvn spring-boot:run
```

**JMeter not found?**
- Add JMeter to PATH
- Or use full path: `C:\apache-jmeter\bin\jmeter.bat`

**401 Unauthorized errors?**
- Check test user credentials in Test Plan variables
- Ensure user exists in database

## Next Steps

1. ✅ Run basic tests
2. 📊 Review results
3. 🔧 Customize test scenarios
4. 📈 Add more endpoints
5. 🚀 Run load tests

For detailed documentation, see [README.md](README.md)

