/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Enterprise Color System
      colors: {
        // Core System Colors (CSS Variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Enterprise Semantic Colors
        enterprise: {
          // Main backgrounds
          'bg-primary': '#FEFEFE',
          'bg-secondary': '#F8F9FA', 
          'bg-card': '#FFFFFF',
          'bg-border': '#E9ECEF',
          
          // Text colors
          'text-primary': '#212529',
          'text-secondary': '#6C757D',
          
          // Functional colors
          'action-primary': '#0D6EFD',
          'success': '#198754',
          'warning': '#FFC107',
          'error': '#DC3545',
          'info': '#0DCAF0',
        },
      },
      
      // Enterprise Typography System
      fontSize: {
        'title-1': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'title-2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'micro': ['10px', { lineHeight: '14px', fontWeight: '400' }],
      },
      
      // Enterprise Font Families
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      // Enterprise Spacing System
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Enterprise Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'enterprise': '8px',
      },
      
      // Enterprise Shadows
      boxShadow: {
        'enterprise-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'enterprise-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'enterprise-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      
      // Enterprise Icon Sizes
      width: {
        'icon-xs': '16px',
        'icon-sm': '20px', 
        'icon-md': '24px',
        'icon-lg': '32px',
      },
      height: {
        'icon-xs': '16px',
        'icon-sm': '20px',
        'icon-md': '24px', 
        'icon-lg': '32px',
      },
      
      // Responsive Breakpoints
      screens: {
        'mobile': '768px',
        'tablet': '1024px', 
        'desktop': '1440px',
      },
      
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
