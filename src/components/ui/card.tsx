'use client'

)import React from 'react'

export const Card = React.forwardRef<
HTMLDivElement,React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-white text-gray-900 shadow {className}`}
    {...props}
  />
))