import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Enhanced Card component optimized for animated backgrounds
 * Provides better visual separation and backdrop effects
 */
const EnhancedCard = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "enhanced-card-with-background",
    glass: "glass backdrop-blur-md bg-background/80 border-border/50",
    solid: "bg-card border-border shadow-lg",
    interactive: "enhanced-card-with-background hover:scale-[1.02] cursor-pointer"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border text-card-foreground shadow-sm transition-all duration-300",
        variants[variant],
        className
      )}
      {...props} 
    />
  );
});
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} 
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} 
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} 
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props} 
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} 
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
};