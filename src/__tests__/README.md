# Test Suite Documentation

This directory contains the automated test suite for the Crypto Price Alert Service.

## Test Structure

```
src/__tests__/
├── setup.ts                    # Test setup and utilities
├── unit/                       # Unit tests
│   └── services/
│       ├── authService.test.ts
│       └── alertService.test.ts
└── integration/                # Integration tests
    ├── auth.test.ts
    ├── alerts.test.ts
    └── health.test.ts
```

## Test Categories

### Unit Tests
- **Location**: `src/__tests__/unit/`
- **Purpose**: Test individual functions and methods in isolation
- **Coverage**: Service layer business logic
- **Dependencies**: Mocked external dependencies

### Integration Tests
- **Location**: `src/__tests__/integration/`
- **Purpose**: Test complete API endpoints and request-response cycles
- **Coverage**: HTTP endpoints, authentication, validation
- **Dependencies**: Real database (test database), actual HTTP requests

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Setup

### Database
- Tests use a separate test database
- Database is cleaned between each test
- Test data is isolated from development data

### Environment
- Tests run with `NODE_ENV=test`
- Test-specific configuration is loaded
- JWT secrets and database URLs are test-specific

## Test Utilities

### Database Utilities
- `cleanDatabase()`: Cleans all tables between tests
- `createTestUser()`: Creates a test user
- `createTestCryptocurrency()`: Creates a test cryptocurrency
- `createTestAlert()`: Creates a test alert

### Authentication
- Tests automatically handle JWT token generation
- Authentication middleware is tested with real tokens
- Token validation is tested with invalid tokens

## Test Coverage

### AuthService Tests
- ✅ User registration (success and error cases)
- ✅ User login (success and error cases)
- ✅ Token verification
- ✅ Password hashing validation

### AlertService Tests
- ✅ Alert creation
- ✅ Alert retrieval (by user, by ID)
- ✅ Alert updates
- ✅ Alert deletion
- ✅ Price alert triggering logic

### API Integration Tests
- ✅ Authentication endpoints (register, login)
- ✅ Alert CRUD operations
- ✅ Health endpoint
- ✅ Error handling and validation
- ✅ Authentication middleware

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is cleaned between tests
3. **Realistic Data**: Tests use realistic but simple test data
4. **Error Cases**: Both success and error scenarios are tested
5. **Authentication**: All protected endpoints test both authenticated and unauthenticated access

## Adding New Tests

### Unit Tests
1. Create test file in `src/__tests__/unit/services/`
2. Import the service and test utilities
3. Test individual methods with various inputs
4. Mock external dependencies when needed

### Integration Tests
1. Create test file in `src/__tests__/integration/`
2. Use `supertest` for HTTP requests
3. Test complete request-response cycles
4. Include authentication and validation tests

### Test Naming
- Use descriptive test names that explain the scenario
- Group related tests in `describe` blocks
- Use `it` blocks for individual test cases

Example:
```typescript
describe('AlertService', () => {
  describe('createAlert', () => {
    it('should create an alert successfully', async () => {
      // test implementation
    });

    it('should throw error for non-existent cryptocurrency', async () => {
      // test implementation
    });
  });
});
``` 