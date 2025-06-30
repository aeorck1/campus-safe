'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useAuthStore } from '@/lib/auth'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const role = useAuthStore((state) => state.user?.role?.name || state.user?.role || null)
  console.log("TThis is the role", role)

  let roleBgClass = ""
  if (role === "Admin" || role === "ADMIN" || role === "System Admin") {
    roleBgClass = "bg-role-admin dark:bg-role-admin-dark"
  } else if (role === "SECURITY_PERSONNEL" || role === "SECURITY_PERSONNEL") {
    roleBgClass = "bg-role-security dark:bg-role-security-dark"
  }

  return (
    <NextThemesProvider {...props}>
      <div className={roleBgClass + " min-h-screen"}>
        {children}
      </div>
    </NextThemesProvider>
  )
}
