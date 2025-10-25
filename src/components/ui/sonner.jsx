import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      offset="39px"
      closeButton={true}
      richColors
      toastOptions={{
        style: {
          padding: '16px',
          gap: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          minWidth: '400px',
        },
        classNames: {
          toast: 'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: 'group-[.toast]:bg-transparent group-[.toast]:text-red-500 group-[.toast]:border-0 hover:group-[.toast]:bg-red-500/10 hover:group-[.toast]:text-red-600 group-[.toast]:absolute group-[.toast]:right-2 group-[.toast]:top-1/2 group-[.toast]:-translate-y-1/2 group-[.toast]:left-auto',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }