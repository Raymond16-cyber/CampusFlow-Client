import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, LayoutDashboard, List, History, Settings } from "lucide-react";
import { images } from "@/constants/images";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center ">
            <img src={images.CampusFlowLogo} alt="CampusFlow Logo" style={{width:90,height:90}} />
              <span className="inline-block font-bold text-md tracking-tight text-primary">
                CampusFlow
              </span>
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/queues"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <List className="mr-2 h-4 w-4" />
                  Queues
                </Link>
                <Link
                  href="/history"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  {user?.fullName}
                </span>
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
