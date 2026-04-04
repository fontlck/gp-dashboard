'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<
HTMLInputElement,
InputProps
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 wi-full rounded-md border bg-surface-050 px-3 py-2 text-sm file:hidden ${className}`}
    {...props}
  />
))