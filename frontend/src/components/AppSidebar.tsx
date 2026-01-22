import React from "react"
import { Home, Car, Search, Users, Wallet, Bell, MessageCircle, Settings, LogOut, HelpCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My Rides", url: "/my-rides", icon: Car },
  { title: "Find Ride", url: "/search", icon: Search },
  { title: "Offer Ride", url: "/offer", icon: Users },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Help", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
]

export const AppSidebar = React.memo(function AppSidebar() {
  const navigate = useNavigate()
  const user = React.useMemo(
    () => JSON.parse(localStorage.getItem("user") || '{"firstName":"User","email":"user@checkpoint.com"}'),
    []
  )

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }, [navigate])

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">CP</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-sidebar-foreground truncate">CheckPoint</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">Ride Share</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user.profileImageUrl} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user.firstName?.[0]}{user.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user.firstName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 px-2"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3 mr-2 shrink-0" />
          <span className="text-xs">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
})
