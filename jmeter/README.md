# JMeter Performance Testing for Coach AI

This directory contains JMeter test plans for performance and load testing of the Coach AI backend API.

## 📋 Prerequisites

1. **Install JMeter**
   - Download from: https://jmeter.apache.org/download_jmeter.cgi
   - Extract and add to PATH
   - Or use: `choco install jmeter` (Windows) / `brew install jmeter` (Mac)

2. **Backend Server Running**
   - Ensure backend is running on `http://localhost:8081`
   - Database should be populated with test data

3. **Test Users**
   - Create test users in the database or use existing ones
   - Default test user: `test@etud.com` / `password123`

## 🚀 Quick Start

### Option 1: Using JMeter GUI

1. **Open JMeter:**
   ```bash
   jmeter
   ```

2. **Load Test Plan:**
   - File → Open → Select `Coach_AI_Test_Plan.jmx`

3. **Configure Variables:**
   - Edit Test Plan → User Defined Variables
   - Update `BASE_URL`, `USER_EMAIL`, `USER_PASSWORD` if needed

4. **Run Test:**
   - Click Start (green play button)
   - View results in "View Results Tree" and "Summary Report"

### Option 2: Using Command Line (Non-GUI Mode)

```bash
# Run test plan
jmeter -n -t Coach_AI_Test_Plan.jmx -l results.jtl -e -o report/

# View HTML report
# Open report/index.html in browser
```

### Option 3: Using Scripts

**Windows:**
```powershell
.\run-jmeter-tests.ps1
```

**Linux/Mac:**
```bash
./run-jmeter-tests.sh
```

## 📊 Test Scenarios

### 1. Authentication Tests
- **Login API**: Tests user authentication
- **Signup API**: Tests user registration
- **Threads**: 5 users
- **Duration**: 1 loop per user

### 2. Public API Tests
- **Get All Formations**: Fetches all published formations
- **Get Formation by ID**: Fetches specific formation details
- **Threads**: 10 concurrent users
- **Loops**: 10 iterations per user
- **Ramp-up**: 5 seconds

### 3. User API Tests (Authenticated)
- **Login**: Authenticates and extracts JWT token
- **Get Profile**: Fetches user profile (requires auth)
- **Get Courses**: Fetches user courses (requires auth)
- **Threads**: 20 concurrent users
- **Loops**: 5 iterations per user
- **Ramp-up**: 10 seconds

## 🔧 Configuration

### Test Plan Variables

Edit these in JMeter GUI under Test Plan → User Defined Variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8081` | Backend API base URL |
| `USER_EMAIL` | `test@etud.com` | Test user email |
| `USER_PASSWORD` | `password123` | Test user password |

### Load Testing Scenarios

#### Light Load
- Users: 10
- Ramp-up: 5 seconds
- Duration: 1 minute

#### Medium Load
- Users: 50
- Ramp-up: 30 seconds
- Duration: 5 minutes

#### Heavy Load
- Users: 100
- Ramp-up: 60 seconds
- Duration: 10 minutes

## 📈 Understanding Results

### Key Metrics

1. **Response Time**
   - Average: Mean response time
   - Median: 50th percentile
   - 90th/95th/99th Percentile: Response time for X% of requests

2. **Throughput**
   - Requests per second
   - Higher is better

3. **Error Rate**
   - Percentage of failed requests
   - Should be < 1% for good performance

4. **Response Codes**
   - 200: Success
   - 401: Unauthorized (check token)
   - 500: Server error

### Viewing Results

**In JMeter GUI:**
- **View Results Tree**: Detailed request/response
- **Summary Report**: Statistics summary
- **Graph Results**: Visual graphs

**HTML Report (Non-GUI):**
- Open `report/index.html` in browser
- Includes charts, statistics, and error analysis

## 🎯 API Endpoints Tested

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Public APIs
- `GET /api/formations` - List all formations
- `GET /api/formations/{id}` - Get formation details

### User APIs (Authenticated)
- `GET /api/user/profile` - Get user profile
- `GET /api/courses` - Get user courses
- `GET /api/user/enrollments` - Get user enrollments
- `GET /api/user/notifications` - Get notifications

### Admin APIs (Authenticated)
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Get analytics

### Trainer APIs (Authenticated)
- `GET /api/trainer/formations` - Get trainer formations
- `GET /api/trainer/students` - Get trainer students

## 🔧 Customization

### Add More Test Scenarios

1. Right-click on Thread Group → Add → Sampler → HTTP Request
2. Configure:
   - Server Name: `${BASE_URL}`
   - Method: GET/POST/PUT/DELETE
   - Path: `/api/endpoint`
   - Add Headers if needed (Authorization, Content-Type)

### Modify Load Parameters

1. Select Thread Group
2. Change:
   - Number of Threads (users)
   - Ramp-up Period (seconds)
   - Loop Count

### Add Assertions

1. Right-click on HTTP Request → Add → Assertions → Response Assertion
2. Configure:
   - Response Code: 200
   - Response Message: Contains "success"

## 📝 Test Data

### Sample Test Users

Create these users in your database:

```sql
-- User
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES ('test@etud.com', '$2a$10$...', 'Test', 'User', 'USER', 'ACTIVE');

-- Trainer
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES ('trainer@form.com', '$2a$10$...', 'Trainer', 'Name', 'TRAINER', 'ACTIVE');

-- Admin
INSERT INTO users (email, password, first_name, last_name, role, status) 
VALUES ('admin@adm.com', '$2a$10$...', 'Admin', 'Name', 'ADMIN', 'ACTIVE');
```

## 🐛 Troubleshooting

### Issue: Connection Refused
**Solution:** Ensure backend is running on port 8081

### Issue: 401 Unauthorized
**Solution:** 
- Check if token is being extracted correctly
- Verify user credentials
- Check token expiration

### Issue: 500 Server Error
**Solution:**
- Check backend logs
- Verify database connection
- Check if test data exists

### Issue: JMeter Out of Memory
**Solution:**
- Edit `jmeter.bat` (Windows) or `jmeter.sh` (Linux/Mac)
- Increase heap size: `-Xmx2g` or `-Xmx4g`

## 📚 Additional Resources

- [JMeter Documentation](https://jmeter.apache.org/usermanual/)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Performance Testing Guide](https://jmeter.apache.org/usermanual/get-started.html)

## 🎯 Next Steps

1. **Add More Endpoints**: Test all API endpoints
2. **Database Testing**: Add JDBC tests for database performance
3. **Stress Testing**: Test system limits
4. **Spike Testing**: Test sudden load increases
5. **Endurance Testing**: Test long-running scenarios

## 📊 Sample Results Interpretation

```
Summary Report:
- Samples: 1000
- Average: 150ms
- Median: 120ms
- 90th Percentile: 250ms
- Error Rate: 0.5%
- Throughput: 50 req/sec
```

**Interpretation:**
- ✅ Good: Average < 200ms, Error rate < 1%
- ⚠️ Warning: Average 200-500ms, Error rate 1-5%
- ❌ Critical: Average > 500ms, Error rate > 5%

