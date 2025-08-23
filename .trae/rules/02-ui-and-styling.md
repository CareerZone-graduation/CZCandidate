# 2. UI and Styling

## 🎨 UI Component Library: shadcn/ui
Our project is built on `shadcn/ui`. This is a strict rule.

- **DO NOT** use raw HTML elements like `<button>`, `<div>` with complex styling, `<input>`, or `<table>` for building the UI.
- **ALWAYS** use the pre-built components from `src/components/ui/`.

**Examples:**
- For buttons, use `<Button>`.
- For cards, use `<Card>`, `<CardHeader>`, `<CardContent>`, etc.
- For inputs, use `<Input>`.
- For dialogs/modals, use `<Dialog>` or `<AlertDialog>`.
- For forms, use the components from `form.jsx` combined with a form library if needed.

When asked to build a new UI, your first step is to identify which `shadcn/ui` components can be composed to create it.

## 💅 Styling with Tailwind CSS
- **Utility-First**: Use Tailwind CSS utility classes for all styling.
- **`cn` Utility**: For conditional classes, **ALWAYS** use the `cn` utility from `src/lib/utils.js`. This correctly merges Tailwind classes.

**Example:**
```javascript
import { cn } from "@/lib/utils";

// Correct usage
<div
  className={cn(
    "p-4 rounded-md",
    isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100",
    className // Allow passing extra classes as a prop
  )}
>
  ...
</div>
```

- **Custom CSS**: Avoid writing custom CSS in `.css` files unless absolutely necessary for a complex, non-reusable style. The `src/index.css` file is primarily for base styles and Tailwind layers.

## 📐 Layouts
- Use `DashboardLayout.jsx` for all pages within the authenticated user dashboard.
- Use `AuthLayout.jsx` for login and registration pages.
- The main content of a page should be wrapped in a `<main>` tag with appropriate padding, as seen in `DashboardLayout.jsx`.
```

---
