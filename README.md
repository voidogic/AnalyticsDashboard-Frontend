# SmartWinnrr Frontend - Angular Application

Analytics Dashboard Frontend built with Angular 16.

## Prerequisites

- **Node.js**: v16.0.0 or higher (Recommended: v18.0.0+)
- **npm**: v7.0.0 or higher (Recommended: v9.0.0+)
- **Angular CLI**: v16.0.0

## Installation & Setup

### 1. Prerequisites Setup

Verify your system versions:

```bash
# Check Node.js version (should be 16.0.0 or higher)
node --version

# Check npm version (should be 7.0.0 or higher)
npm --version

# Install Angular CLI globally (optional, recommended)
npm install -g @angular/cli@16
```

### 2. Install Dependencies

```bash
npm install
```

#### Installed Dependencies (Angular 16):

**Core Angular Packages**:
- @angular/animations: ^16.0.0
- @angular/common: ^16.0.0
- @angular/compiler: ^16.0.0
- @angular/core: ^16.0.0
- @angular/forms: ^16.0.0
- @angular/platform-browser: ^16.0.0
- @angular/platform-browser-dynamic: ^16.0.0
- @angular/router: ^16.0.0

**Additional Libraries**:
- chart.js: ^4.5.1 (Charts and analytics visualization)
- rxjs: ~7.8.0 (Reactive programming)
- tslib: ^2.3.0 (TypeScript runtime)
- zone.js: ~0.13.0 (Execution context)

**Development Dependencies**:
- @angular/cli: ~16.0.0
- @angular/compiler-cli: ^16.0.0
- typescript: ~5.1.3
- karma: ~6.4.0 (Test runner)
- jasmine-core: ~4.6.0 (Testing framework)

### 3. Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

## Build & Deployment

### Development Build

```bash
npm run build
```

Output will be stored in the `dist/` directory.

### Production Build

```bash
ng build --configuration production
```

Builds the project for production with optimization.

### Watch Mode

For development with auto-reload:

```bash
npm run watch
```

## Testing

Run unit tests via Karma:

```bash
npm test
```

Run tests with code coverage:

```bash
ng test --code-coverage
```

## Application Structure

```
src/
├── app/
│   ├── components/          # Angular components
│   ├── services/            # Services for API calls and data sharing
│   ├── guards/              # Route guards (auth protection)
│   ├── interceptors/        # HTTP interceptors
│   ├── app.module.ts        # Main module
│   ├── app.component.ts     # Root component
│   └── app-routing.module.ts # Routing configuration
├── environments/            # Environment-specific configs
├── index.html              # Main HTML file
├── main.ts                 # Entry point
└── styles.css              # Global styles
```

## Key Features

- **Component-Based Architecture**: Modular and reusable components
- **Routing**: Built-in navigation with Angular Router
- **Services**: Centralized data and API communication
- **Forms**: Reactive forms for data binding
- **Charts & Analytics**: Chart.js integration for data visualization
- **TypeScript**: Type-safe development with TypeScript ~5.1.3
- **Authentication**: Route guards and interceptors for secure access

## Environment Configuration

The application supports multiple environments. Configure in `environments/`:

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

## Troubleshooting

**Port 4200 already in use**:
```bash
ng serve --port 4300
```

**Module not found errors**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Angular CLI not recognized**:
```bash
# Install globally or use npx
npx ng serve
```

**Build errors**:
```bash
# Clear Angular cache
ng cache clean
npm install --legacy-peer-deps
```

## API Connection

Ensure the backend server is running on `http://localhost:5000` before using API-dependent features.

Backend API: [Backend Repository](../backend/README.md)
