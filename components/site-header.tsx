"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Plus, Shield } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { AuthStatus } from "@/components/auth-status"
import { useAuthStore } from "@/lib/auth"

export function SiteHeader() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
      protected: true,
    },
    {
      href: "/incidents",
      label: "Incidents",
      active: pathname === "/incidents" || pathname.startsWith("/incidents/"),
    },
    {
      href: "/map",
      label: "Campus Map",
      active: pathname === "/map",
    },
  ]

  // Filter routes based on authentication status
  const filteredRoutes = routes.filter((route) => !route.protected || isAuthenticated)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <Shield className="h-6 w-6 text-campus-primary" />
            <span className="hidden font-bold sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary">
              UI Crowd Source
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                  route.active ? "text-campus-primary" : "text-foreground/60",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="flex md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-campus-primary" />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary">
                  UI Crowd Source
                </span>
              </Link>
              <nav className="mt-8 flex flex-col gap-4">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-foreground/70 transition-colors hover:text-foreground",
                      route.active && "text-campus-primary font-medium",
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link href="/report" className="flex items-center text-campus-primary font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Incident
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex-1 sm:grow-0"></div>
          <nav className="flex items-center space-x-2">
            {isAuthenticated && (
              <>
                <Button asChild variant="default" size="sm" className="bg-campus-primary hover:bg-campus-primary/90">
                  <Link href="/report">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Incident
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-campus-primary">
                        3
                      </Badge>
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>New incident reported near Library</DropdownMenuItem>
                    <DropdownMenuItem>Your report has been reviewed</DropdownMenuItem>
                    <DropdownMenuItem>Campus alert: Scheduled maintenance</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <ThemeToggle />
            <AuthStatus />
          </nav>
        </div>
      </div>
    </header>
  )
}
