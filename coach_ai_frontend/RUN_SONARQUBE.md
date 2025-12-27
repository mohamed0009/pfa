# How to View Coverage in SonarQube

## Prerequisites

1. **SonarQube Server** must be running (usually at `http://localhost:9000`)
2. **SonarScanner** must be installed on your machine
3. **SonarQube Token** - You need a token from your SonarQube instance

## Step-by-Step Guide

### Step 1: Generate Test Coverage

First, run the tests with coverage:

```bash
cd coach_ai_frontend
npm test -- --code-coverage --watch=false
```

This will generate the coverage report at: `coach_ai_frontend/coverage/lcov.info`

### Step 2: Install SonarScanner (if not already installed)

**Option A: Using npm (recommended for Angular projects)**
```bash
npm install -g sonarqube-scanner
```

**Option B: Download from SonarQube website**
- Download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
- Add to PATH

### Step 3: Get SonarQube Token

1. Log in to your SonarQube server (usually `http://localhost:9000`)
2. Go to **My Account** → **Security**
3. Generate a new token
4. Copy the token (you'll need it in the next step)

### Step 4: Run SonarQube Analysis

**Option A: Using sonar-scanner command (if installed globally)**

```bash
cd coach_ai_frontend
sonar-scanner \
  -Dsonar.projectKey=coach-ai-frontend \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

**Option B: Using npx (no global installation needed)**

```bash
cd coach_ai_frontend
npx sonarqube-scanner \
  -Dsonar.projectKey=coach-ai-frontend \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

**Option C: Using the sonar-project.properties file (recommended)**

The `sonar-project.properties` file is already configured. You just need to add your token:

```bash
cd coach_ai_frontend
sonar-scanner -Dsonar.login=YOUR_TOKEN_HERE
```

Or set it as an environment variable:
```bash
export SONAR_TOKEN=YOUR_TOKEN_HERE
sonar-scanner
```

### Step 5: View Results in SonarQube

1. Open your SonarQube server in browser: `http://localhost:9000`
2. Go to **Projects** → **Coach AI Frontend**
3. Click on the project
4. You'll see the **Overview** tab with:
   - **Coverage** percentage (should now show ~29% instead of 0%)
   - **Issues** count
   - **Code Smells**
   - **Security Hotspots**

### Step 6: View Detailed Coverage

1. In the project overview, click on **Measures** tab
2. Navigate to **Coverage** section
3. You can see:
   - Overall coverage percentage
   - Coverage by file
   - Uncovered lines
   - Coverage history

## Quick Script

You can create a script to automate this:

**Windows (run-sonar.ps1):**
```powershell
# Generate coverage
npm test -- --code-coverage --watch=false

# Run SonarQube analysis
sonar-scanner -Dsonar.login=$env:SONAR_TOKEN
```

**Linux/Mac (run-sonar.sh):**
```bash
#!/bin/bash
# Generate coverage
npm test -- --code-coverage --watch=false

# Run SonarQube analysis
sonar-scanner -Dsonar.login=$SONAR_TOKEN
```

## Troubleshooting

### Issue: "sonar-scanner: command not found"
**Solution:** Install SonarScanner or use `npx sonarqube-scanner`

### Issue: "Authentication failed"
**Solution:** Check your SonarQube token and server URL

### Issue: Coverage still shows 0%
**Solution:** 
1. Verify `coverage/lcov.info` exists after running tests
2. Check `sonar-project.properties` has correct path: `sonar.typescript.lcov.reportPaths=coverage/lcov.info`
3. Make sure the analysis completed successfully

### Issue: "Project not found"
**Solution:** 
1. First time: The project will be created automatically
2. Make sure project key matches: `coach-ai-frontend`

## Configuration File

The `sonar-project.properties` file is already configured with:
- Project key: `coach-ai-frontend`
- Source path: `src`
- Coverage path: `coverage/lcov.info`
- Exclusions: node_modules, spec files, etc.

## Next Steps

After running the analysis, you should see:
- ✅ Coverage: ~29% (up from 0%)
- ✅ Test files detected
- ✅ Code quality metrics
- ✅ Security issues
- ✅ Code smells

You can now track coverage improvements over time in SonarQube!

