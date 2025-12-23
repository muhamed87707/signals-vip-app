# Implementation Plan: Admin Authentication Security

## Overview

تنفيذ نظام مصادقة آمن للوحة تحكم الأدمن باستخدام JWT tokens و HTTP-only cookies.

## Tasks

- [x] 1. Setup authentication infrastructure
  - [x] 1.1 Create auth utility library (`lib/auth.js`)
    - Implement `generateToken(payload)` function using jsonwebtoken
    - Implement `verifyToken(token)` function
    - Implement `setAuthCookie(response, token)` function
    - Implement `clearAuthCookie(response)` function
    - Read JWT_SECRET from environment variable
    - _Requirements: 2.3, 3.1, 3.2, 3.6_

  - [x] 1.2 Write property test for token round-trip
    - **Property 3: Token Round-Trip Consistency**
    - **Validates: Requirements 6.3**

  - [x] 1.3 Write property test for token validation
    - **Property 4: Token Validation Rejects Invalid Tokens**
    - **Validates: Requirements 6.2, 6.4, 6.5**

- [x] 2. Implement authentication API endpoints
  - [x] 2.1 Create login endpoint (`app/api/auth/login/route.js`)
    - Accept POST with password in body
    - Verify password against ADMIN_PASSWORD env variable
    - Generate JWT token on success
    - Set HTTP-only cookie with token
    - Return appropriate error on failure
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2_

  - [x] 2.2 Create verify endpoint (`app/api/auth/verify/route.js`)
    - Extract token from cookie
    - Verify token validity and expiration
    - Return authentication status
    - _Requirements: 1.6, 3.5_

  - [x] 2.3 Create logout endpoint (`app/api/auth/logout/route.js`)
    - Clear authentication cookie
    - Return success response
    - _Requirements: 1.7, 3.6_

  - [x] 2.4 Write property test for password verification
    - **Property 1: Password Verification Correctness**
    - **Validates: Requirements 1.2, 1.4, 1.5**

  - [x] 2.5 Write property test for password not exposed
    - **Property 6: Password Never Exposed in Responses**
    - **Validates: Requirements 1.3**

- [x] 3. Checkpoint - Ensure auth API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement route protection middleware
  - [x] 4.1 Create auth middleware (`lib/authMiddleware.js`)
    - Extract and verify JWT from request cookies
    - Return 401 for unauthenticated requests
    - Export helper function for protected routes
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 4.2 Protect signals API routes
    - Add auth check to POST, PUT, DELETE methods in `/api/signals/route.js`
    - Keep GET method public (with user context)
    - _Requirements: 5.3, 5.4_

  - [x] 4.3 Protect users API routes
    - Add auth check to POST method in `/api/users/route.js`
    - Keep GET method public
    - _Requirements: 5.3, 5.4_

  - [x] 4.4 Protect settings API routes
    - Add auth check to POST method in `/api/settings/route.js`
    - Keep GET method public
    - _Requirements: 5.3, 5.4_

  - [x] 4.5 Write property test for protected routes
    - **Property 5: Protected Routes Require Authentication**
    - **Validates: Requirements 5.2, 5.5**

- [x] 5. Checkpoint - Ensure protected routes tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update Admin Panel frontend
  - [x] 6.1 Remove hardcoded password from admin page
    - Remove `const ADMIN_PASSWORD = '123'` from `app/admin/page.js`
    - Remove client-side password comparison
    - _Requirements: 4.4_

  - [x] 6.2 Update login handler to use API
    - Modify `handleLogin` to call `/api/auth/login`
    - Handle success/error responses
    - Remove sessionStorage usage for auth
    - _Requirements: 4.1, 4.3_

  - [x] 6.3 Add authentication check on page load
    - Call `/api/auth/verify` on component mount
    - Set authenticated state based on response
    - Handle token expiration gracefully
    - _Requirements: 4.2, 4.5_

  - [x] 6.4 Update logout handler to use API
    - Modify `handleLogout` to call `/api/auth/logout`
    - Clear local state on success
    - _Requirements: 4.6_

- [x] 7. Create environment configuration
  - [x] 7.1 Create .env.example file
    - Document ADMIN_PASSWORD variable
    - Document JWT_SECRET variable
    - Include instructions for Vercel setup
    - _Requirements: 2.5_

  - [x] 7.2 Update .env.local with new variables
    - Add ADMIN_PASSWORD (for local development)
    - Add JWT_SECRET (for local development)
    - _Requirements: 2.1, 2.3_

- [x] 8. Final checkpoint - Full integration test
  - Ensure all tests pass, ask the user if questions arise.
  - Test full login flow manually
  - Verify protected routes work correctly

## Notes

- All tasks including property-based tests are required
- JWT library: `jsonwebtoken` (needs to be installed)
- Cookie handling uses Next.js built-in `cookies()` API
- All API routes use Next.js App Router format
