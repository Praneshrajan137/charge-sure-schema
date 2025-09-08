"use client"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "../store/useAppStore"

export function Header() {
  const { user, isAuthenticated } = useAppStore()

  const handleLogin = () => {
    // TODO: Implement login modal/redirect
    console.log("[v0] Login clicked")
  }

  const handleRegister = () => {
    // TODO: Implement register modal/redirect
    console.log("[v0] Register clicked")
  }

  const handleLogout = () => {
    // TODO: Implement logout
    console.log("[v0] Logout clicked")
  }

  return (
    <header className="bg-[#1E40AF] text-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-[#1E40AF]" />
          </div>
          <span className="text-xl font-semibold tracking-tight">ChargeSure</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-sm hover:text-blue-200 transition-colors font-medium">ChargeSure for Business</button>
        <button className="text-sm hover:text-blue-200 transition-colors font-medium">EN</button>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-blue-700 hover:text-white transition-all duration-200 font-medium"
            >
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogin}
              className="text-white hover:bg-blue-700 hover:text-white transition-all duration-200 font-medium"
            >
              Login
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegister}
              className="text-white hover:bg-blue-700 hover:text-white transition-all duration-200 font-medium"
            >
              Register
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
