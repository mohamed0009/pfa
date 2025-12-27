#!/bin/bash
# Bash script to run JMeter tests for Coach AI
# Usage: ./run-jmeter-tests.sh

TEST_PLAN="Coach_AI_Test_Plan.jmx"
USERS=10
RAMP_UP=5
DURATION=60
OUTPUT_DIR="jmeter-results"

echo "========================================"
echo "JMeter Performance Testing - Coach AI"
echo "========================================"
echo ""

# Check if JMeter is installed
if ! command -v jmeter &> /dev/null; then
    echo "❌ JMeter not found in PATH!"
    echo "Please install JMeter or add it to PATH"
    echo "Download from: https://jmeter.apache.org/download_jmeter.cgi"
    exit 1
fi

echo "✅ JMeter found: $(which jmeter)"
echo ""

# Check if test plan exists
if [ ! -f "$TEST_PLAN" ]; then
    echo "❌ Test plan not found: $TEST_PLAN"
    exit 1
fi

echo "📋 Test Plan: $TEST_PLAN"
echo "👥 Users: $USERS"
echo "⏱️  Ramp-up: $RAMP_UP seconds"
echo "⏳ Duration: $DURATION seconds"
echo ""

# Create output directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="$OUTPUT_DIR/$TIMESTAMP"
mkdir -p "$RESULTS_DIR"

echo "📁 Results will be saved to: $RESULTS_DIR"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s -f http://localhost:8081/api/auth/test > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Warning: Could not connect to backend at http://localhost:8081"
    echo "   Make sure the backend is running before starting tests"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo ""
echo "🚀 Starting JMeter tests..."
echo ""

# Run JMeter in non-GUI mode
JTL_FILE="$RESULTS_DIR/results.jtl"
HTML_REPORT="$RESULTS_DIR/html-report"

jmeter -n -t "$TEST_PLAN" \
    -l "$JTL_FILE" \
    -e -o "$HTML_REPORT" \
    -JBASE_URL=http://localhost:8081 \
    -JUSER_EMAIL=test@etud.com \
    -JUSER_PASSWORD=password123

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tests completed successfully!"
    echo ""
    echo "📊 Results:"
    echo "   JTL File: $JTL_FILE"
    echo "   HTML Report: $HTML_REPORT/index.html"
    echo ""
    echo "🌐 Opening HTML report..."
    
    # Open HTML report in default browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "$HTML_REPORT/index.html"
    elif command -v open &> /dev/null; then
        open "$HTML_REPORT/index.html"
    else
        echo "Please open $HTML_REPORT/index.html in your browser"
    fi
else
    echo ""
    echo "❌ Tests failed! Check the error messages above."
    exit 1
fi

echo ""
echo "========================================"
echo "Testing Complete!"
echo "========================================"

