import * as React from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UserCardProps = {
  name: string;
  email?: string;
  role: string;
  status?: "active" | "suspended" | "banned";
  avatarUrl?: string | null;
  className?: string;
};

const statusVariant: Record<NonNullable<UserCardProps["status"]>, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  suspended: "warning",
  banned: "danger",
};

export function UserCard({ name, email, role, status, avatarUrl, className }: UserCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-md", className)}>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar name={name} src={avatarUrl ?? undefined} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name}</p>
          {email ? <p className="truncate text-sm text-muted-foreground">{email}</p> : null}
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {role}
            </Badge>
            {status ? (
              <Badge variant={statusVariant[status]} className="text-xs capitalize">
                {status}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
