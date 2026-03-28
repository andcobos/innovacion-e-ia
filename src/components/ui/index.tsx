import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:pointer-events-none disabled:opacity-50 font-sans",
          {
            "bg-brand-primary text-white hover:bg-brand-primary-hover hover:shadow-[0_8px_20px_rgba(255,127,127,0.35)] hover:-translate-y-[1px]": variant === "default",
            "border border-brand-border bg-white hover:bg-brand-secondary text-brand-text": variant === "outline",
            "hover:bg-brand-secondary hover:text-brand-primary text-brand-muted": variant === "ghost",
            "bg-brand-danger text-white hover:bg-red-500 hover:shadow-[0_8px_20px_rgba(248,113,113,0.35)] hover:-translate-y-[1px]": variant === "destructive",
            "bg-brand-secondary text-brand-primary hover:bg-pink-100": variant === "secondary",
            "h-[48px] px-6 py-2": size === "default",
            "h-10 px-4": size === "sm",
            "h-14 px-8 text-base": size === "lg",
            "h-[48px] w-[48px]": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[48px] w-full rounded-[12px] border border-brand-border bg-white px-4 py-2 text-sm text-brand-text file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-[#9CA3AF] placeholder:italic outline-none transition-all focus:border-2 focus:border-brand-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Card
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "rounded-[16px] border border-brand-border bg-brand-card text-brand-text shadow-[0_4px_24px_rgba(255,127,127,0.08)] transition-all duration-200 ease-in-out hover:-translate-y-[2px]", 
        className
      )} 
      {...props} 
    />
  )
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-bold font-serif leading-tight tracking-tight text-brand-text", className)} {...props} />
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-brand-muted font-sans", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 font-sans", className)} {...props} />
}

// Label
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-semibold leading-none text-brand-text font-sans peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
)
Label.displayName = "Label"
