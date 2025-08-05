# Comuniti E2E Test Suite

## Overview

This test suite uses Playwright to validate the core user flows in the Comuniti platform. The tests are organized into three main categories:

- **Authentication Flow** (`auth.spec.ts`) - User sign-in, validation, and navigation
- **Ambassador Onboarding** (`onboarding.spec.ts`) - Complete ambassador registration process  
- **Public Directory** (`directory.spec.ts`) - Public ambassador profile pages

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Install Playwright browsers (if not already done):
   ```bash
   npx playwright install
   ```

### Execute Test Suite

**Note**: In the current Replit environment, Playwright requires additional system dependencies that aren't available through the Nix package manager. The test framework has been set up and configured for future use.

Run all tests (when dependencies are available):
```bash
npx playwright test --reporter=line
```

Run specific test file:
```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/onboarding.spec.ts
npx playwright test tests/directory.spec.ts
```

Run with UI mode for debugging (local development):
```bash
npx playwright test --ui
```

**Alternative Testing**: For immediate testing needs, you can:
1. Test manually through the browser
2. Use the browser developer tools for validation
3. Set up tests in a local environment with full system dependencies

### Test Environment

- **Base URL**: `http://localhost:5000`
- **Browsers**: Chromium (configured for Replit), Firefox/WebKit disabled for compatibility
- **Mode**: Headless with Replit-specific launch options
- **Dependencies**: Requires system browser libraries (see Troubleshooting section)

## Test Coverage Map

### Authentication Tests (A1-A5)
- **A1**: Sign-in page accessibility and UI elements
- **A2**: Form validation for invalid credentials
- **A3**: Error handling for non-existent accounts
- **A4**: Navigation between sign-in and home
- **A5**: Language selector functionality

### Onboarding Tests (A3-A10)
- **A3**: Platform selection and country dropdown validation (10 countries)
- **A4**: Follower threshold enforcement
- **A5**: Complete account creation flow
- **A6**: Business addition in list-builder
- **A7**: Branding step completion
- **A8**: LocalStorage cleanup verification
- **A9**: Navigation between onboarding steps
- **A10**: Error handling throughout onboarding

### Directory Tests (A1-A10)
- **A1**: Public directory page loads correctly
- **A2**: 404 handling for non-existent ambassadors
- **A3**: Business card display and functionality
- **A4**: Language selector on directory pages
- **A5**: Responsive design across viewports
- **A6**: WhatsApp link validation
- **A7**: Google Maps link validation
- **A8**: Member since date formatting
- **A9**: SEO elements (title, meta description)
- **A10**: Performance budget validation

## Test Data

### Realistic Test Data
- **Email**: `qa+${Date.now()}@example.com`
- **Password**: `Test1234!`
- **Business**: `QA Bistro ${timestamp}`
- **Countries**: 10 supported countries (Costa Rica, Panama, Mexico, etc.)

### Test Fixtures
- **Avatar Image**: `tests/fixtures/test-avatar.png` (1x1 pixel PNG)
- **Helper Functions**: `tests/helpers.ts` with reusable utilities

## Helper Functions

### `createAccount(page, user, country)`
Programmatically completes account creation via UI

### `addBusiness(page, business)`
Fills out business form in list-builder

### `completeBranding(page, listName, tagline)`
Uploads image and completes branding step

### `verifyCountryOptions(page)`
Validates country dropdown has exactly 10 countries

## Configuration

The test configuration is defined in `playwright.config.ts`:

- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries on CI, 0 locally
- **Trace Collection**: On first retry for debugging
- **Web Server**: Automatically starts dev server before tests

## Debugging Failed Tests

### View Test Results
```bash
npx playwright show-report
```

### Debug Specific Test
```bash
npx playwright test tests/auth.spec.ts --debug
```

### Generate Test Code
```bash
npx playwright codegen localhost:5000
```

## Updating Tests

### Adding New Tests
1. Create test file in `tests/` directory
2. Import helpers from `./helpers.ts`
3. Use realistic test data generators
4. Follow existing naming pattern (A1-A10)

### Modifying Existing Tests
1. Update selectors if UI changes
2. Modify test data if requirements change
3. Update expected countries list if new countries added
4. Run tests locally before committing

### Test Maintenance
- **Country List**: Update `EXPECTED_COUNTRIES` in `helpers.ts`
- **Selectors**: Use semantic selectors (roles, text) over CSS
- **Test Data**: Generate unique data to avoid conflicts
- **Assertions**: Use specific, meaningful assertions

## CI/CD Integration

Tests run automatically in CI with:
- **Headless Mode**: No browser UI shown
- **Single Worker**: Prevents resource conflicts
- **Line Reporter**: Concise output for CI logs
- **Retry Logic**: Handles flaky network conditions

## Troubleshooting

### Common Issues

**Browser dependencies missing (Replit)**:
```
Error: Host system is missing dependencies to run browsers
```
- This is expected in the current Replit environment
- System browser libraries aren't available via Nix package manager
- Tests are configured and ready for environments with full dependencies

**Tests fail due to timing**:
- Use `waitForPageLoad()` helper
- Add `page.waitForLoadState('networkidle')`

**Selectors not found**:
- Verify UI elements exist in current implementation
- Use Playwright inspector: `npx playwright test --debug`

**Database conflicts**:
- Use unique timestamps in test data
- Clean up test data if necessary

**Network timeouts**:
- Check if dev server is running
- Verify database connection is stable

### Getting Help

1. Check Playwright documentation: https://playwright.dev
2. Review test logs and traces
3. Use `console.log()` in test files for debugging
4. Run tests in headed mode to see browser actions