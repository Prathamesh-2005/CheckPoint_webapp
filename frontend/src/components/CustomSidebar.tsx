import React, { useState } from "react"
import { Home, Car, Search, Users, Wallet, BarChart3, Settings, LogOut, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My Rides", url: "/my-rides", icon: Car },
  { title: "Find Ride", url: "/find-ride", icon: Search },
  { title: "Offer Ride", url: "/offer-ride", icon: Users },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Profile", url: "/profile", icon: Settings },
]

interface CustomSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const CustomSidebar = React.memo(({ isOpen, onClose }: CustomSidebarProps) => {
  const [activeItem, setActiveItem] = useState("Home")
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || '{"firstName":"User","email":"user@checkpoint.com"}')

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }, [navigate])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[#0a0a0a] border-r border-white/5 transition-transform duration-200 ease-out",
          "md:translate-x-0 md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: "256px" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
                  <span className="text-sm font-bold text-black">CP</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">CheckPoint</h2>
                  <p className="text-xs text-white/40">Ride Share</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5 md:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Application
              </p>
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setActiveItem(item.title)
                    navigate(item.url)
                    if (window.innerWidth < 768) onClose()
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                    activeItem === item.title
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="bg-white text-black text-xs">
                  {user.firstName?.[0]}{user.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{user.firstName}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white/60 hover:bg-white/5 hover:text-white h-8"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3 mr-2" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
})

CustomSidebar.displayName = "CustomSidebar"
