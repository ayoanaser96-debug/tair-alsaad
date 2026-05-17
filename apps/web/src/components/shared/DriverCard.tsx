import { MessageCircle, Phone } from "lucide-react";
import * as React from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { RatingStars } from "./RatingStars";

export type DriverCardProps = {
  name: string;
  avatarUrl?: string | null;
  rating: number;
  vehicleLabel: string;
  phone?: string;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
};

export function DriverCard({ name, avatarUrl, rating, vehicleLabel, phone, onMessage, onCall, className }: DriverCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-md", className)}>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={avatarUrl ?? undefined} size="lg" />
          <div>
            <p className="font-semibold">{name}</p>
            <RatingStars value={rating} />
            <p className="text-sm text-muted-foreground">{vehicleLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onMessage ? (
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onMessage}>
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          ) : null}
          {onCall && phone ? (
            <Button type="button" size="sm" className="gap-2" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
