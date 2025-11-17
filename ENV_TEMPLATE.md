# Environment Variables Template

Copy this content to a `.env` file in the project root.

```env
# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=30000

# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Environment
# Options: development, staging, production
ENV=development
DEBUG_MODE=true

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
ENABLE_PUSH_NOTIFICATIONS=false

# Sentry Configuration (Optional)
# Get your DSN from: https://sentry.io/
SENTRY_DSN=
```

## Setup Instructions

1. Create a `.env` file in the project root
2. Copy the template above
3. Fill in your actual values
4. **Never commit `.env` to version control** (already in .gitignore)

## Required Variables

- `API_BASE_URL`: Your backend API URL
- `OPENAI_API_KEY`: Required for AI coach features (if using OpenAI)

## Optional Variables

All other variables have default values and are optional.

