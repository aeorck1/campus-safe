"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Plus, Shield, MoreVertical } from "lucide-react"

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
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { AuthStatus } from "@/components/auth-status"
import { useAuthStore } from "@/lib/auth"
import { Notification } from "@/lib/auth"

export function SiteHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const[notificationCount, setNotificationCount] = useState(0)

  const [notifications, setNotifications] = useState<Notification[]>([])
const notification = useAuthStore((state)=>(state.getUserNotification))
  const { user } = useAuthStore()
  const markNotification = useAuthStore((state)=>(state.markNotification))

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    user?.role?.name === "Admin" || user?.role?.name === "System Admin"
      ? {
          href: "/admin",
          label: "Admin",
          active: pathname === "/admin",
          protected: true,
        }
      : user?.role?.name === "Security Personnel"
      ? {
          href: "/security",
          label: "Security Dashboard",
          active: pathname === "/security",
          protected: true,
        }
      : {
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
  ].filter(Boolean)

  // Filter routes based on authentication status
  const filteredRoutes = routes.filter((route) => !route.protected || isAuthenticated)

  // Close sidebar on route change (mobile navigation)
  useEffect(() => {
    const handleRouteChange = () => setSidebarOpen(false)
    window.addEventListener("next-route-change", handleRouteChange)
    return () => {
      window.removeEventListener("next-route-change", handleRouteChange)
    }
  }, [])

  // Fallback: close sidebar on any link click
  const handleSidebarLinkClick = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Patch for Next.js app router: fire custom event on navigation
  useEffect(() => {
    const origPush = router.push
    router.push = (...args) => {
      window.dispatchEvent(new Event("next-route-change"))
      return origPush(...args)
    }
    return () => {
      router.push = origPush
    }
  }, [router])


useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  const fetchNotifications = async () => {
    try {
      const response = await notification();
      if (response.success) {
      
        setNotificationCount(response.data.results.filter((item: any) => item.read === false).length);
        setNotifications(response.data.results || []);
      }
    } catch (error) {
      // Optionally handle error
    }
  };

  if (isAuthenticated) {
    fetchNotifications(); // Initial fetch
    interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isAuthenticated, notification]);

  const handleNotificationClick = async (id: string, read: boolean) => {
    try {
      const response = await markNotification(id, read);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setNotificationCount((prev) => prev - 1);
      }
    } catch (error) {
      // Optionally handle error
    }
  };



  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <Shield className="h-6 w-6 text-campus-primary" />
            <span className="hidden font-bold sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary">
              Secure UI
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
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="flex md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2" onClick={handleSidebarLinkClick}>
                <Shield className="h-6 w-6 text-campus-primary" />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary">
                  Secure UI
                </span>
              </Link>
              <nav className="mt-8 flex flex-col gap-4">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-foreground/70 transition-colors hover:text-foreground",
                      route.active && "text-campus-secondary font-medium",
                    )}
                    onClick={handleSidebarLinkClick}
                  >
                    {route.label}
                  </Link>
                ))}
                <Link href="/report" className="flex items-center text-campus-primary font-medium" onClick={handleSidebarLinkClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Incident
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex-1 sm:grow-0"></div>
          <nav className="flex items-center space-x-2">
            
              <>
                <Button asChild variant="default" size="sm" className="bg-campus-primary hover:bg-campus-primary/90 hidden">
                  <Link href="/report">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Incident
                  </Link>
                </Button>
</>
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
                     {notificationCount > 0 && (
                        <Badge className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-xs text-white flex items-center justify-center">
                          {notificationCount}
                          <span className="sr-only">Notifications</span>
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <DropdownMenuItem className="text-muted-foreground">No notifications</DropdownMenuItem>
                    ) : (
                      notifications.map((notif: any) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={cn(
                            "flex flex-col items-start group relative pr-10",
                            !notif.read && "bg-orange-50"
                          )}
                          asChild={!!notif.link}
                          onClick={() => handleNotificationClick(notif.id, true)}
                        >
                          <div className="w-full flex items-start">
                            <div className="flex-1">
                              {notif.link ? (
                                <Link href={notif.link} className="w-full block">
                                  <div className="font-medium">{notif.title}</div>
                                  <div className="text-xs text-muted-foreground">{notif.message}</div>
                                  <div className="text-[10px] text-right w-full text-muted-foreground">
                                    {notif.date_created ? new Date(notif.date_created).toLocaleString() : ""}
                                  </div>
                                </Link>
                              ) : (
                                <div className="w-full">
                                  <div className="font-medium">{notif.title}</div>
                                  <div className="text-xs text-muted-foreground">{notif.message}</div>
                                  <div className="text-[10px] text-right w-full text-muted-foreground">
                                    {notif.date_created ? new Date(notif.date_created).toLocaleString() : ""}
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* 3 vertical dots and Mark as read */}
                            <div className="absolute top-2 right-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleNotificationClick(notif.id, true);
                                    }}
                                    disabled={notif.read}
                                  >
                                    Mark as read
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
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
