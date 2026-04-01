import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/features/auth";

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="text-primary font-semibold tracking-tight hover:opacity-90"
        >
          Compare Yourself!
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/compare">Compare</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Sign In</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
