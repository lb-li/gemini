/**
 * Enterprise Design Tokens
 * Centralized design system configuration for consistent UI implementation
 */

export const designTokens = {
  // Color System
  colors: {
    // Main Color Palette
    main: {
      bgPrimary: '#FEFEFE',
      bgSecondary: '#F8F9FA',
      bgCard: '#FFFFFF',
      border: '#E9ECEF',
      textPrimary: '#212529',
      textSecondary: '#6C757D',
    },
    
    // Functional Colors
    functional: {
      actionPrimary: '#0D6EFD',
      success: '#198754',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#0DCAF0',
    },
    
    // Dark Theme Adaptations
    dark: {
      bgPrimary: '#1A1A1A',
      bgSecondary: '#2D2D2D',
      bgCard: '#242424',
      border: '#404040',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
    },
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      title1: { size: '28px', lineHeight: '36px', weight: '600' },
      title2: { size: '24px', lineHeight: '32px', weight: '600' },
      title3: { size: '20px', lineHeight: '28px', weight: '500' },
      bodyLarge: { size: '16px', lineHeight: '24px', weight: '400' },
      body: { size: '14px', lineHeight: '20px', weight: '400' },
      small: { size: '12px', lineHeight: '16px', weight: '400' },
      micro: { size: '10px', lineHeight: '14px', weight: '400' },
    },
  },
  
  // Spacing System
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px',
  },
  
  // Icon Sizes
  iconSizes: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
  },
  
  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
} as const;

// Type definitions for design tokens
export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof designTokens.colors;
export type TypographyTokens = typeof designTokens.typography;
export type SpacingTokens = typeof designTokens.spacing;

// Utility functions for accessing design tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value;
};

export const getTypography = (size: keyof typeof designTokens.typography.fontSize) => {
  return designTokens.typography.fontSize[size];
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size];
};