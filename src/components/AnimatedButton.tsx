"use client"

import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AnimatedButtonProps {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  variant?: "primary" | "secondary" | "outline"
  className?: string
}

export default function AnimatedButton({
  onClick,
  disabled = false,
  children,
  variant = "primary",
  className = "",
}: AnimatedButtonProps) {
  const baseClasses =
    "w-full h-14 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:hover:scale-100"

  const variantClasses = {
    primary:
      "text-white bg-black hover:bg-gray-800 border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 p-[2px] disabled:opacity-50",
    secondary: "bg-yellow-500 hover:bg-yellow-600 text-black hover:shadow-lg",
    outline: "border-black text-black hover:bg-black hover:text-white hover:shadow-lg",
  }

  if (variant === "primary") {
    return (
      <Button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses.primary} ${className}`}>
        <div className="w-full h-full bg-black rounded-full flex items-center justify-center disabled:bg-gray-600">
          {children}
        </div>
      </Button>
    )
  }

  return (
    <Button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </Button>
  )
}
