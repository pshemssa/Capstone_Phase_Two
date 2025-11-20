"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Edit, Menu, X, LogOut, User, Settings, List } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) {
          setResults(data.results || []);
          setSearchOpen(true);
        }
      } catch (e) {
        // ignore aborts
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  return (
    <header className="border-b border-yellow-700/20 sticky top-0 bg-yellow-800 hover:bg-yellow-700 transition z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Search */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center font-bold text-yellow-800">
                LY
              </div>
              <div>
                <h1 className="font-serif text-xl tracking-tight text-white group-hover:text-yellow-400 transition">
                  Lumen Yard
                </h1>
                <div className="text-[10px] text-yellow-200 -mt-0.5">
                  STORIES THAT LINGER
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 relative">
              <Search className="w-4 h-4 text-yellow-200 mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Search stories..."
                className="bg-transparent border-none outline-none text-sm w-64 text-white placeholder-yellow-200/70"
              />
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 w-[28rem] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {searchLoading ? (
                    <div className="p-4 text-sm text-gray-500">Searching...</div>
                  ) : results.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {results.map((r) => (
                        <li key={r.id} className="hover:bg-gray-50">
                          <Link href={`/post/${r.slug}`} className="block px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{r.title}</div>
                            <div className="text-xs text-gray-500">By {r.author?.name || "Unknown"} · ❤ {r._count?.likes || 0} · 💬 {r._count?.comments || 0}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No matches</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Removed Trending link */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/write"
                  className="flex items-center text-white hover:text-yellow-400 transition"
                >
                  <Edit className="w-5 h-5 mr-1" />
                  <span>Write</span>
                </Link>
                {/* Removed Followers link */}
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-full">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${(session?.user as any)?.username || ''}`}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-posts">
                        <List className="mr-2 h-4 w-4" />
                        My Posts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-yellow-400 transition font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-yellow-800 px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-50 shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white hover:text-yellow-400 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-yellow-800">
          <nav className="px-4 py-4 space-y-3">
            <Link href="/for-you" className="block text-white hover:text-yellow-400 transition font-medium" onClick={() => setMobileOpen(false)}>
              For You
            </Link>
            {/* Removed Trending link */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/write"
                  className="block text-white hover:text-yellow-400 transition font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Write
                </Link>
                {/* Removed Followers link */}
                <Link
                  href={`/users/${(session?.user as any)?.username || ""}`}
                  className="block text-white hover:text-yellow-400 transition font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setMobileOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-yellow-400 transition font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-white hover:text-yellow-400 transition font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full py-2 px-4 bg-white text-yellow-800 rounded-full text-sm font-bold text-center hover:bg-yellow-50 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}