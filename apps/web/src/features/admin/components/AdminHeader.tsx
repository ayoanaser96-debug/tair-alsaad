import { Bell, Moon, Search, Sun, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const { t } = useTranslation();
  const { auth, logout } = useAuth();
  const [q, setQ] = useState("");
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tairalsaad_theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    toast.message(t("toasts.searchQueued", { query: q }), {
      description: t("toasts.searchWireDescription"),
    });
  }

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form onSubmit={onSearch} className="relative w-full max-w-md flex-1">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("admin.shell.header.searchPlaceholder")}
          className="h-11 ps-9"
          aria-label={t("admin.shell.header.searchAria")}
        />
      </form>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={toggleTheme}
          aria-label={t("admin.shell.header.toggleTheme")}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative shrink-0"
              aria-label={t("admin.shell.header.notificationsAria")}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>{t("admin.shell.header.alerts")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{t("admin.shell.header.alertDriverApp")}</span>
              <span className="text-xs text-muted-foreground">{t("admin.shell.header.alertDriverAppDesc")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{t("admin.shell.header.alertDispute")}</span>
              <span className="text-xs text-muted-foreground">{t("admin.shell.header.alertDisputeDesc")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="secondary" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden max-w-[120px] truncate sm:inline">{auth?.user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{auth?.user.name}</p>
              <p className="text-xs text-muted-foreground">{auth?.user.email ?? auth?.user.phone}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>{t("admin.shell.header.signOut")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
