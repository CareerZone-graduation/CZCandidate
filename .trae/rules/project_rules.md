---
applyTo: '**'
---
# GitHub Copilot Instructions for CareerZone Recruiter Project

## 🚀 High-Level Goal
You are an expert ReactJS/TypeScript developer. Your primary goal is to assist in building and maintaining the "CareerZone Recruiter" application. You must generate code that is high-quality, consistent, maintainable, and follows the established patterns and conventions of this repository.

## ✨ The Golden Rule
**Always prioritize using existing components, services, hooks, and utilities from the project before writing new ones.** Before generating code, scan the `src/` directory, especially `src/components/ui`, `src/services`, `src/utils`, and `src/hooks` to find what you can reuse.

## 📚 Core Technologies
- **Framework**: React 18 with Vite
- **Language**: JavaScript (ES2020+). Although the project is in JS, write code that is clear, typed (using JSDoc or ready for TypeScript migration), and follows modern best practices.
- **UI Components**: **shadcn/ui**. This is our primary component library.
- **Styling**: Tailwind CSS.
- **Routing**: React Router DOM v7+.
- **API Client**: `axios`, configured in `src/services/apiClient.js`.
- **State Management**: React Context API for auth (`AuthContext`). For server state, we prefer `useState`/`useEffect` for now but are moving towards a more robust solution like TanStack Query (React Query).
- **Linting**: ESLint with the rules defined in `eslint.config.js`.

## 📖 Detailed Instructions
To understand our specific conventions, please refer to the detailed documentation in the `.github\instructions` directory:

- **[Architecture and Conventions](./01-architecture-and-conventions.md)**: Folder structure, component design, and naming conventions.
- **[UI and Styling](./02-ui-and-styling.md)**: How to build interfaces with `shadcn/ui` and Tailwind CSS.
- **[API and State Management](./03-api-and-state-management.md)**: Rules for data fetching, state management, and using our `apiClient`.
- **[Async Logic and Testing](./04-async-logic-and-testing.md)**: Handling loading/error states and writing tests.

When I ask for a new feature, always consider these documents as the single source of truth for your implementation.