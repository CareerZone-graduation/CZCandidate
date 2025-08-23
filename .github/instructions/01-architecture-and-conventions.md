# 1. Architecture and Conventions

## 📁 Folder Structure
Adhere strictly to the existing folder structure within `src/`:

- `components/`: Reusable React components.
  - `common/`: Components used across multiple features (e.g., `EmptyState`, `ErrorState`).
  - `ui/`: Core UI components from `shadcn/ui`. **NEVER modify these directly.**
  - `[feature]/`: Components specific to a feature (e.g., `jobs/JobForm.jsx`).
- `contexts/`: React Context providers (e.g., `AuthContext.jsx`).
- `hooks/`: Custom React hooks.
- `layouts/`: Components that define the page structure (e.g., `DashboardLayout.jsx`).
- `pages/`: Top-level route components. Each page corresponds to a route in `AppRouter`.
- `routes/`: Application routing configuration (`AppRouter.jsx`).
- `services/`: API interaction layer. All `axios` calls must be encapsulated here.
- `utils/`: Helper functions that are pure and reusable (e.g., `formatDate.js`).

## 🧩 Component Design
- **Function Components**: All components MUST be function components using hooks.
- **Props**:
  - Always destructure props: `const MyComponent = ({ title, onSave }) => { ... }`.
  - For clarity, especially for complex components, use JSDoc to define prop types.
    ```javascript
    /**
     * @param {{
     *   job: object | null;
     *   onClose: () => void;
     *   onSuccess: () => void;
     * }} props
     */
    const JobForm = ({ job, onClose, onSuccess }) => { ... };
    ```
- **Modularity**: Keep components small and focused on a single responsibility. If a component becomes too large, break it down into smaller, more manageable pieces.

## 📛 Naming Conventions
- **Components**: `PascalCase` (e.g., `JobList.jsx`, `DashboardHeader.jsx`).
- **Hooks**: `camelCase` with a `use` prefix (e.g., `useAuth.js`, `useDebounce.js`).
- **Variables & Functions**: `camelCase` (e.g., `const [isLoading, setIsLoading] = useState(true);`).
- **Props**: `camelCase` (e.g., `<Button onClick={...} />`). For event handlers, use `on` prefixes (e.g., `onSave`, `onClose`).
- **Services/Utils**: `camelCase` (e.g., `getMyJobs.js`, `formatCurrency.js`).