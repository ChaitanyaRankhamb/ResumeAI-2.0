"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, User, LogOut, Settings, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function Navbar() {
  const { user, isLogged, logout } = useUser();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-xl tracking-tight">
              ResumeAI
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#ai-section"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            AI Section
          </Link>
          <Link
            href="#tech-stack"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Tech-Stack
          </Link>
          <Link
            href="#use-cases"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Use-Cases
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!isLogged && (
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3 pl-4">
            {isLogged && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all">
                    <AvatarImage src={user?.avatar} alt={user?.username} />

                    <AvatarFallback
                      className={`${getAvatarColor(user?.username)} text-white`}
                    >
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.username || "User Account"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate w-44">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isLogged ? (
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer text-success focus:text-success"
                      onClick={() => router.push("/login")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
