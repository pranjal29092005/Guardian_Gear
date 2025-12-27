/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary accent - Electric blue/purple gradient
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                // Secondary accent - Purple
                secondary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                },
                // Dark backgrounds
                dark: {
                    50: '#18181b',
                    100: '#151519',
                    200: '#121216',
                    300: '#0f0f13',
                    400: '#0c0c0f',
                    500: '#0a0e1a',
                    600: '#0a0d14',
                    700: '#080b10',
                    800: '#06080c',
                    900: '#030507',
                    950: '#020304',
                },
                // Glass morphism colors
                glass: {
                    light: 'rgba(255, 255, 255, 0.05)',
                    medium: 'rgba(255, 255, 255, 0.10)',
                    dark: 'rgba(0, 0, 0, 0.3)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'dark-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #1a1d2e 50%, #0f172a 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-sm': '0 0 10px rgba(99, 102, 241, 0.2)',
                'glow-md': '0 0 15px rgba(99, 102, 241, 0.25)',
                'glow-lg': '0 0 30px rgba(99, 102, 241, 0.4)',
                'glow-xl': '0 0 40px rgba(139, 92, 246, 0.5)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
                'glow-purple-lg': '0 0 30px rgba(168, 85, 247, 0.5)',
                'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.2)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-up': 'slide-up 0.5s ease-out',
                'slide-down': 'slide-down 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'gradient-shift': 'gradient-shift 8s ease infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { 
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                        opacity: '1',
                    },
                    '50%': { 
                        boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
                        opacity: '0.9',
                    },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                '2xs': '0.625rem',
            },
        },
    },
    plugins: [],
}
