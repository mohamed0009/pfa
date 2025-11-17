# 🚨 Critical Fixes Required - Action Plan

## Priority 1: Security Fixes (URGENT)

### 1. Password Hashing Implementation

**File:** `lib/core/services/auth_service.dart`

**Current Issue:**
- Passwords are not hashed
- No password verification in login
- Security vulnerability

**Steps to Fix:**

1. Add crypto package to `pubspec.yaml`:
```yaml
dependencies:
  crypto: ^3.0.3
```

2. Create password utility:
```dart
// lib/core/utils/password_util.dart
import 'dart:convert';
import 'package:crypto/crypto.dart';

class PasswordUtil {
  static String hashPassword(String password) {
    final bytes = utf8.encode(password);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }
  
  static bool verifyPassword(String password, String hashedPassword) {
    return hashPassword(password) == hashedPassword;
  }
}
```

3. Update AuthService:
   - Hash password in `register()` method
   - Store hashed password securely
   - Verify password in `login()` method

**Estimated Time:** 2-3 hours  
**Risk if not fixed:** CRITICAL - Authentication bypass

---

### 2. Environment Configuration

**Files to Create:**
- `.env.example`
- Update `.gitignore` (verify .env is ignored)
- Update README.md with setup instructions

**Estimated Time:** 30 minutes

---

### 3. Remove Debug Code

**Files to Fix:**
- `lib/core/config/app_config.dart:34` - Replace `print()` with `logger.warning()`

**Estimated Time:** 5 minutes

---

### 4. Clean Up Repository

**Actions:**
- Delete `lib/features/auth/presentation/login_screen.dart.bak`
- Update `.gitignore` to exclude backup files

**Estimated Time:** 5 minutes

---

## Priority 2: Code Quality Improvements

### 5. Add Constants File

**Create:** `lib/core/constants/app_constants.dart`

**Move magic numbers:**
- API timeouts
- Animation durations
- Mock delays

**Estimated Time:** 30 minutes

---

### 6. Improve Error Messages

**Create:** `lib/core/constants/error_messages.dart`

**Centralize all error messages**

**Estimated Time:** 1 hour

---

## Priority 3: Testing

### 7. Service Tests

**Create test files:**
- `test/core/services/auth_service_test.dart`
- `test/core/services/ai_coach_service_test.dart`
- `test/core/services/learning_service_test.dart`

**Estimated Time:** 1-2 days

---

### 8. Provider Tests

**Create:** `test/core/providers/user_provider_test.dart`

**Estimated Time:** 4-6 hours

---

## Implementation Order

### Week 1 (Critical)
1. ✅ Password hashing (Day 1-2)
2. ✅ Environment config (Day 1)
3. ✅ Remove debug code (Day 1)
4. ✅ Clean repository (Day 1)

### Week 2 (High Priority)
5. ✅ Constants file (Day 1)
6. ✅ Error messages (Day 1)
7. ✅ Service tests (Day 2-3)
8. ✅ Provider tests (Day 4-5)

---

## Testing Checklist

After each fix:
- [ ] Run `flutter analyze`
- [ ] Run `flutter test`
- [ ] Manual testing
- [ ] Code review

---

## Notes

- All fixes should be done in feature branches
- Create PRs for review
- Update tests as you go
- Document changes in commit messages

