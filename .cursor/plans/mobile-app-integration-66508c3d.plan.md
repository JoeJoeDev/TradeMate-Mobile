<!-- 66508c3d-f2c3-4277-870e-e7249389e983 44b3c376-aad1-4e87-a603-f7ab7369b983 -->
# Mobile App Integration Plan

## Architecture Overview

**Backend**: Laravel REST API with Sanctum token authentication

**Frontend**: Expo/React Native app in `/mobile` directory

**Auth**: Laravel Sanctum API tokens (stateless, mobile-friendly)

---

## Phase 1: Backend API Setup

### 1.1 Install and Configure Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

- Add `HasApiTokens` trait to [app/Models/User.php](app/Models/User.php)
- Configure `config/sanctum.php` for token expiration and domains

### 1.2 Create API Routes

Create `routes/api.php` with versioned endpoints:

```
/api/v1/auth/login
/api/v1/auth/register
/api/v1/auth/logout
/api/v1/auth/user

/api/v1/dashboard/stats
/api/v1/customers
/api/v1/jobs
/api/v1/invoices
/api/v1/quotes
/api/v1/settings
```

### 1.3 Create API Controllers

Create dedicated API controllers in `app/Http/Controllers/Api/V1/`:

- `AuthController` - Login, register, logout, current user
- `DashboardController` - Stats and overview data
- `CustomerController` - CRUD operations
- `JobController` - CRUD + start/complete/calendar
- `InvoiceController` - CRUD + PDF generation + payments
- `QuoteController` - CRUD operations

### 1.4 Create API Resources

Create Laravel API Resources in `app/Http/Resources/`:

- `UserResource`, `CustomerResource`, `JobResource`, `InvoiceResource`, `QuoteResource`
- These ensure consistent JSON structure and hide sensitive fields

### 1.5 API Middleware

- Apply Sanctum `auth:sanctum` middleware to protected routes
- Ensure company scoping works via existing `CompanyScope` trait

---

## Phase 2: Expo Mobile App Setup

### 2.1 Initialize Project

```bash
npx create-expo-app@latest mobile --template blank-typescript
```

Directory structure in `/mobile`:

```
mobile/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── services/               # API client
├── stores/                 # State management
├── hooks/                  # Custom hooks
└── types/                  # TypeScript types
```

### 2.2 Core Dependencies

- `expo-router` - File-based navigation
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client
- `expo-secure-store` - Secure token storage
- `nativewind` - Tailwind CSS for React Native

### 2.3 Authentication Flow

- Login/Register screens
- Token storage in SecureStore
- Auth context with auto-refresh
- Protected route handling

---

## Phase 3: Mobile App Screens

### 3.1 Core Screens

| Screen | Features |

|--------|----------|

| Dashboard | Stats cards, recent jobs, quick actions |

| Customers | List with search, detail view, create/edit |

| Jobs | List/calendar view, detail, start/complete, create/edit |

| Invoices | List, detail, PDF preview, add payment |

| Quotes | List, detail, create/edit |

| Settings | Company settings, profile |

### 3.2 Mobile-Specific Features

- Pull-to-refresh on all lists
- Offline capability (future enhancement)
- Push notifications (future enhancement)
- Camera integration for receipts/photos (future enhancement)

---

## Key Files to Create/Modify

**Backend:**

- `app/Models/User.php` - Add HasApiTokens
- `routes/api.php` - API routes
- `app/Http/Controllers/Api/V1/*` - API controllers
- `app/Http/Resources/*` - JSON resources

**Mobile:**

- `mobile/` - New Expo app directory
- `mobile/services/api.ts` - API client
- `mobile/app/(auth)/*` - Auth screens
- `mobile/app/(tabs)/*` - Main app screens

### To-dos

- [ ] Install Laravel Sanctum and configure for API token authentication
- [ ] Create versioned API routes in routes/api.php
- [ ] Create API controllers for Auth, Dashboard, Customers, Jobs, Invoices, Quotes
- [ ] Create Laravel API Resources for consistent JSON responses
- [ ] Initialize Expo app with TypeScript in /mobile directory
- [ ] Build mobile authentication flow with SecureStore
- [ ] Create all mobile app screens matching web features