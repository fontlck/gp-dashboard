import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'
    const variants = {
      default: 'bg-lime-500 hover:bg-lime-400 text-black',
      outline: 'border border-zinc-700 text-white hover:bg-zinc-800',
      ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800',
    }
    return (
      <button ref={ref} className={base + ' ' + variants[variant] + ' ' + className} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
