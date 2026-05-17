import { Bell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useMarkNotificationReadMutation, useNotificationsQuery } from "@/features/orders/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const { data } = useNotificationsQuery(open);
  const markRead = useMarkNotificationReadMutation();

  const items = data?.notifications ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-border bg-card shadow-sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[min(360px,50vh)]">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No updates yet.</p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn("cursor-pointer flex-col items-start gap-0 rounded-none px-3 py-2", !n.read && "bg-primary/5")}
                onClick={() => {
                  if (!auth?.accessToken || n.read) return;
                  void markRead.mutateAsync(n.id);
                }}
              >
                <span className="font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                {n.orderId ? (
                  <Link
                    to="/dashboard/sender"
                    className="text-xs text-primary underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View order
                  </Link>
                ) : null}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
