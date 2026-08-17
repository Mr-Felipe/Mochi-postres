/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Lienzo y Fondos Base — Tonos claros cálidos (inspiración Nexus + rosa Mochi)
        canvas: {
          DEFAULT: '#FDF5F0', // Fondo crema rosado muy claro
          card: '#FFFAF8',    // Cards — casi blanco con tint rosa
          faint: '#FFF0EA',  // Contenedores secundarios e inputs — rosa muy pálido
        },
        // Tipografía y Contraste — Negro
        primary: {
          DEFAULT: '#1A1A1A',  // Texto principal — negro
          hover: '#000000',    // Hover — negro puro
          light: '#4A4A4A',    // Texto secundario
          muted: 'rgba(26, 26, 26, 0.75)',
          faint: 'rgba(26, 26, 26, 0.50)',
        },
        // Color de Acento — Rosa Mochi (se mantiene)
        accent: {
          DEFAULT: '#FF758F',
          hover: '#FF5277',
          light: '#FFA0B4',
          soft: '#FFB3C1',
          subtle: '#FFE4E6',
        },
        // Bordes & Separadores — Beige rosado
        border: {
          DEFAULT: '#F0D5CC',  // Bordes — beige rosado suave
          soft: '#F5E0D8',    // Bordes sutiles
          dark: '#C4A08A',    // Bordes fuertes (reemplaza café)
        },
        // Paleta de Sabores & Estados Japoneses
        flavor: {
          matcha: '#80CBC4',
          'matcha-dark': '#065F46',
          'matcha-bg': '#D1FAE5',
          yuzu: '#FDBA74',
          'yuzu-dark': '#C2410C',
          taro: '#CE93D8',
          'taro-dark': '#6B21A8',
          sesame: '#9CA3AF',
          ichigo: '#FF758F',
          chocolate: '#1A1A1A',
        },
        // Estados Funcionales
        status: {
          success: '#065F46',
          'success-bg': '#D1FAE5',
          'success-border': '#A7F3D0',
          warning: '#9A3412',
          'warning-bg': '#FFEDD5',
          danger: '#9F1239',
          'danger-bg': '#FFE4E6',
          'danger-border': '#FDA4AF',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        'xs': '0 1px 3px 0 rgba(196, 160, 138, 0.06)',
        'card': '0 4px 20px -2px rgba(196, 160, 138, 0.08)',
        'floating': '0 12px 32px -4px rgba(196, 160, 138, 0.14)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        slideLeft: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
