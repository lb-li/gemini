/**
 * Enterprise Style Guide
 * Component styling utilities and standards for consistent UI implementation
 */

import { designTokens } from './design-tokens';

// Component variant definitions
export const componentVariants = {
  // Button variants
  button: {
    primary: 'btn-enterprise-primary',
    secondary: 'btn-enterprise-secondary',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  
  // Card variants
  card: {
    default: 'card-enterprise',
    elevated: 'card-enterprise shadow-enterprise-md',
    interactive: 'card-enterprise hover:shadow-enterprise-lg cursor-pointer transition-all',
  },
  
  // Input variants
  input: {
    default: 'input-enterprise',
    error: 'input-enterprise border-destructive focus-visible:ring-destructive',
    success: 'input-enterprise border-green-500 focus-visible:ring-green-500',
  },
  
  // Badge variants
  badge: {
    default: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
    info: 'status-info',
  },
  
  // Typography variants
  typography: {
    h1: 'text-title-1 font-semibold tracking-tight',
    h2: 'text-title-2 font-semibold tracking-tight',
    h3: 'text-title-3 font-medium tracking-tight',
    body: 'text-body',
    bodyLarge: 'text-body-large',
    small: 'text-small text-muted-foreground',
    micro: 'text-micro text-muted-foreground',
  },
  
  // Icon variants
  icon: {
    xs: 'icon-xs',
    sm: 'icon-sm', 
    md: 'icon-md',
    lg: 'icon-lg',
  },
} as const;

// Layout utilities
export const layoutClasses = {
  // Container classes
  container: {
    default: 'container mx-auto px-4',
    narrow: 'container mx-auto px-4 max-w-4xl',
    wide: 'container mx-auto px-4 max-w-7xl',
  },
  
  // Grid layouts
  grid: {
    cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },
  
  // Flex layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  },
  
  // Spacing utilities
  spacing: {
    section: 'py-12 md:py-16 lg:py-20',
    component: 'p-6',
    tight: 'p-4',
    loose: 'p-8',
  },
} as const;

// Animation classes
export const animationClasses = {
  // Transitions
  transition: {
    default: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
  
  // Hover effects
  hover: {
    lift: 'hover:-translate-y-1 hover:shadow-enterprise-md transition-all duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    fade: 'hover:opacity-80 transition-opacity duration-200',
  },
  
  // Loading states
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },
} as const;

// Responsive utilities
export const responsiveClasses = {
  // Hide/show on different screens
  visibility: {
    mobileOnly: 'block md:hidden',
    tabletUp: 'hidden md:block',
    desktopOnly: 'hidden lg:block',
  },
  
  // Responsive text sizes
  text: {
    responsive: 'text-sm md:text-base lg:text-lg',
    responsiveTitle: 'text-xl md:text-2xl lg:text-3xl',
  },
  
  // Responsive spacing
  spacing: {
    responsive: 'p-4 md:p-6 lg:p-8',
    responsiveY: 'py-8 md:py-12 lg:py-16',
  },
} as const;

// Utility functions for dynamic class generation
export const generateClasses = {
  // Generate button classes
  button: (variant: keyof typeof componentVariants.button = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
    const baseClasses = componentVariants.button[variant];
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return `${baseClasses} ${sizeClasses[size]}`;
  },
  
  // Generate card classes
  card: (variant: keyof typeof componentVariants.card = 'default', padding: 'sm' | 'md' | 'lg' = 'md') => {
    const baseClasses = componentVariants.card[variant];
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return `${baseClasses} ${paddingClasses[padding]}`;
  },
  
  // Generate typography classes
  text: (variant: keyof typeof componentVariants.typography, color?: 'primary' | 'secondary' | 'muted') => {
    const baseClasses = componentVariants.typography[variant];
    const colorClasses = {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      muted: 'text-muted-foreground/70',
    };
    return color ? `${baseClasses} ${colorClasses[color]}` : baseClasses;
  },
  
  // Generate icon classes
  icon: (size: 'xs' | 'sm' | 'md' | 'lg' = 'md') => {
    return `icon-${size}`;
  },
};

// CSS-in-JS style objects for programmatic styling
export const styleObjects = {
  // Shadow styles
  shadows: {
    sm: { boxShadow: designTokens.shadows.sm },
    md: { boxShadow: designTokens.shadows.md },
    lg: { boxShadow: designTokens.shadows.lg },
    xl: { boxShadow: designTokens.shadows.xl },
  },
  
  // Border radius styles
  borderRadius: {
    sm: { borderRadius: designTokens.borderRadius.sm },
    md: { borderRadius: designTokens.borderRadius.md },
    lg: { borderRadius: designTokens.borderRadius.lg },
    xl: { borderRadius: designTokens.borderRadius.xl },
  },
  
  // Typography styles
  typography: {
    title1: {
      fontSize: designTokens.typography.fontSize.title1.size,
      lineHeight: designTokens.typography.fontSize.title1.lineHeight,
      fontWeight: designTokens.typography.fontSize.title1.weight,
    },
    title2: {
      fontSize: designTokens.typography.fontSize.title2.size,
      lineHeight: designTokens.typography.fontSize.title2.lineHeight,
      fontWeight: designTokens.typography.fontSize.title2.weight,
    },
    body: {
      fontSize: designTokens.typography.fontSize.body.size,
      lineHeight: designTokens.typography.fontSize.body.lineHeight,
      fontWeight: designTokens.typography.fontSize.body.weight,
    },
  },
} as const;

// Export all utilities
export {
  designTokens,
  componentVariants,
  layoutClasses,
  animationClasses,
  responsiveClasses,
  generateClasses,
  styleObjects,
};