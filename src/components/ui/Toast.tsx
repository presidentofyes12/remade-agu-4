import React from 'react'
import { cn } from '@/lib/utils'

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-background text-foreground',
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-4 shadow-lg',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = 'Toast'

export { Toast } 