
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { useUser } from "@/context/UserContext";
import { getAvatarColor } from "@/getAvatarColor";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export function DashboardNavbar() {
  const { user, isLogged, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4 max-h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-xl tracking-tight">
              ResumeAI
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                className={
                  isLogged
                    ? "flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-muted/60 transition-all duration-200 cursor-pointer"
                    : "flex items-center gap-2 p-0 cursor-pointer"
                }
              >
                {/* Username */}
                {isLogged && (
                  <span className="text-sm font-medium text-foreground truncate">
                    {user?.username}
                  </span>
                )}

                {/* Avatar */}
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={isLogged ? user?.avatar : ""}
                      alt="User"
                      className="h-9 w-9 border border-border shadow-sm hover:scale-105 transition-all duration-200 size-9!"
                    />

                    <AvatarFallback
                      className={`h-9 w-9 border border-border shadow-sm hover:scale-105 transition-all duration-200 ${getAvatarColor(
                        user?.username || "Guest",
                      )} text-white text-sm font-semibold`}
                    >
                      {(user?.username?.charAt(0) || "G").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Indicator to show online status */}
                  {isLogged && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-background" />
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* User Info */}
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {isLogged ? user?.username : "Guest User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate w-44">
                    {isLogged ? user?.email : "guest@example.com"}
                  </p>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Profile & Settings (only when logged in) */}
              {isLogged && (
                <>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </>
              )}

              {/* Login / Logout */}
              {isLogged ? (
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => router.push("/login")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
