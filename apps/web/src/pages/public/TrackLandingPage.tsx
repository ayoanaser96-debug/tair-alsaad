import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackLandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const submit = (): void => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) return;
    navigate(`/track/${encodeURIComponent(trimmed)}`, { replace: false });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center gap-8 bg-gradient-to-br from-sky-50 via-background to-[hsl(35_38%_92%)] px-4 py-16">
      <div className="mx-auto w-full max-w-md space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Track a shipment</h1>
        <p className="text-muted-foreground">
          Receiver view — paste the tracking code you received via SMS or WhatsApp.
        </p>
      </div>
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border bg-card p-6 shadow-lg"
        onSubmit={(ev) => {
          ev.preventDefault();
          submit();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="landing-track-code">Tracking code</Label>
          <Input
            id="landing-track-code"
            value={code}
            autoCapitalize="characters"
            onChange={(ev) => setCode(ev.target.value)}
            placeholder="TS-XXXXXXXX"
          />
        </div>
        <Button type="submit">Open live tracking</Button>
      </form>
    </div>
  );
}
