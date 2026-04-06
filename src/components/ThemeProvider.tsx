"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// The 'type' import should come from the main package, not a sub-folder
import { type ThemeProviderProps } from "next-themes" 

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}