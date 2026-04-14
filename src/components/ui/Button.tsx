import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const VARIANTS = {
  primary:   'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm shadow-primary-200',
  secondary: 'bg-mint-400 hover:bg-mint-500 text-white shadow-sm shadow-mint-100',
  ghost:     'bg-transparent hover:bg-primary-50 text-[#5f6368]',
  danger:    'bg-danger-400 hover:bg-danger-500 text-white shadow-sm',
}
const SIZES = {
  sm: 'text-sm px-3.5 py-2 rounded-xl',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3.5 rounded-2xl font-semibold tracking-tight',
}

export function Button({ children, variant = 'primary', size = 'md', fullWidth, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
