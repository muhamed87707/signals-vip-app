# Requirements Document

## Introduction

تأمين لوحة تحكم الأدمن عن طريق نقل التحقق من كلمة المرور من الـ Frontend إلى الـ Backend، واستخدام متغيرات البيئة لتخزين كلمة المرور، وإضافة نظام JWT Token للحفاظ على جلسة تسجيل الدخول.

## Glossary

- **Auth_API**: واجهة برمجة التطبيقات للمصادقة في الـ Backend
- **JWT_Token**: رمز JSON Web Token يُستخدم للتحقق من هوية المستخدم
- **Admin_Session**: جلسة تسجيل دخول الأدمن المحفوظة في الـ Cookie
- **Environment_Variable**: متغير بيئة يُخزن في Vercel لحماية البيانات الحساسة
- **Admin_Panel**: لوحة تحكم الأدمن في `/admin`
- **Protected_Route**: مسار محمي يتطلب مصادقة للوصول إليه

## Requirements

### Requirement 1: Backend Authentication API

**User Story:** As a developer, I want the password verification to happen on the server side, so that the admin password is never exposed to the client.

#### Acceptance Criteria

1. THE Auth_API SHALL provide a POST endpoint at `/api/auth/login` for admin authentication
2. WHEN a login request is received, THE Auth_API SHALL verify the password against the ADMIN_PASSWORD environment variable
3. THE Auth_API SHALL never expose the actual password in API responses or client-side code
4. IF the password is correct, THEN THE Auth_API SHALL generate a JWT_Token with 24-hour expiration
5. IF the password is incorrect, THEN THE Auth_API SHALL return a 401 status with an error message
6. THE Auth_API SHALL provide a POST endpoint at `/api/auth/verify` to validate existing tokens
7. THE Auth_API SHALL provide a POST endpoint at `/api/auth/logout` to invalidate the session

### Requirement 2: Environment Variable Configuration

**User Story:** As a developer, I want to store the admin password in environment variables, so that it is secure and easily configurable in Vercel.

#### Acceptance Criteria

1. THE System SHALL read the admin password from the ADMIN_PASSWORD environment variable
2. IF ADMIN_PASSWORD is not set, THEN THE System SHALL reject all login attempts with a configuration error
3. THE System SHALL read the JWT secret from the JWT_SECRET environment variable
4. IF JWT_SECRET is not set, THEN THE System SHALL use a fallback secret in development only
5. THE System SHALL document required environment variables in a .env.example file

### Requirement 3: JWT Token Management

**User Story:** As an admin, I want to stay logged in after authentication, so that I don't have to enter the password repeatedly.

#### Acceptance Criteria

1. WHEN authentication succeeds, THE Auth_API SHALL generate a JWT_Token containing admin role and expiration time
2. THE JWT_Token SHALL be stored in an HTTP-only cookie for security
3. THE JWT_Token SHALL expire after 24 hours by default
4. WHEN the token expires, THE Admin_Panel SHALL redirect to the login page
5. THE System SHALL validate the JWT_Token on each protected API request
6. WHEN logout is requested, THE System SHALL clear the authentication cookie

### Requirement 4: Admin Panel Integration

**User Story:** As an admin, I want the login form to use the new secure authentication, so that my credentials are protected.

#### Acceptance Criteria

1. THE Admin_Panel SHALL send login requests to `/api/auth/login` instead of client-side verification
2. THE Admin_Panel SHALL check authentication status on page load via `/api/auth/verify`
3. WHEN authentication fails, THE Admin_Panel SHALL display an appropriate error message
4. THE Admin_Panel SHALL remove the hardcoded ADMIN_PASSWORD constant from client code
5. THE Admin_Panel SHALL handle token expiration gracefully with automatic redirect to login
6. THE Admin_Panel SHALL provide a logout button that calls `/api/auth/logout`

### Requirement 5: Protected API Routes

**User Story:** As a developer, I want admin-only API routes to be protected, so that unauthorized users cannot access sensitive operations.

#### Acceptance Criteria

1. THE System SHALL provide a middleware function to verify JWT tokens on protected routes
2. WHEN an unauthenticated request is made to a protected route, THE System SHALL return 401 status
3. THE System SHALL protect the following existing routes: `/api/signals` (POST, PUT, DELETE), `/api/users` (POST), `/api/settings` (POST)
4. THE System SHALL allow public access to: `/api/signals` (GET with user context), `/api/settings` (GET)
5. IF token verification fails, THEN THE System SHALL return a clear error message

### Requirement 6: Token Serialization and Validation

**User Story:** As a developer, I want tokens to be properly serialized and validated, so that the authentication system is reliable.

#### Acceptance Criteria

1. WHEN generating a token, THE System SHALL encode it using JSON format with required claims (role, exp, iat)
2. THE System SHALL validate token structure before processing
3. FOR ALL valid tokens, encoding then decoding SHALL produce equivalent claims (round-trip property)
4. THE System SHALL reject tokens with invalid signatures
5. THE System SHALL reject expired tokens with appropriate error messages
