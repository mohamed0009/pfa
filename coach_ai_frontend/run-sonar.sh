#!/bin/bash
# Bash script to run tests and SonarQube analysis
# Usage: ./run-sonar.sh

echo "========================================"
echo "SonarQube Analysis for Coach AI Frontend"
echo "========================================"
echo ""

# Check if SONAR_TOKEN environment variable is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "⚠️  SONAR_TOKEN environment variable not set!"
    echo "Please set it using: export SONAR_TOKEN='your-token-here'"
    echo "Or pass it as: SONAR_TOKEN='your-token' ./run-sonar.sh"
    echo ""
    read -p "Enter your SonarQube token (or press Enter to skip SonarQube analysis): " token
    if [ -n "$token" ]; then
        export SONAR_TOKEN="$token"
    else
        echo "Skipping SonarQube analysis. Only running tests..."
    fi
fi

# Step 1: Generate test coverage
echo "Step 1: Running tests with coverage..."
npm test -- --code-coverage --watch=false

if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix errors before running SonarQube analysis."
    exit 1
fi

echo "✅ Tests completed successfully!"
echo ""

# Check if coverage file exists
if [ -f "coverage/lcov.info" ]; then
    echo "✅ Coverage file generated: coverage/lcov.info"
else
    echo "⚠️  Warning: Coverage file not found at coverage/lcov.info"
fi

echo ""

# Step 2: Run SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    echo "Step 2: Running SonarQube analysis..."
    
    # Check if sonar-scanner is available
    if command -v sonar-scanner &> /dev/null; then
        sonar-scanner -Dsonar.login="$SONAR_TOKEN"
    else
        echo "⚠️  sonar-scanner not found. Trying npx..."
        npx sonarqube-scanner -Dsonar.login="$SONAR_TOKEN"
    fi
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SonarQube analysis completed successfully!"
        echo "View results at: http://localhost:9000"
    else
        echo "❌ SonarQube analysis failed!"
    fi
else
    echo "ℹ️  Skipping SonarQube analysis (no token provided)"
    echo "To run analysis, set SONAR_TOKEN and run this script again"
fi

echo ""
echo "========================================"
echo "Analysis Complete!"
echo "========================================"

