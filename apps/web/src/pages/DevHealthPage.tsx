import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/config/env";
import { getHealth, type HealthResponse } from "@/lib/api/health";

export function DevHealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ping = useCallback(async () => {
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    try {
      const h = await getHealth();
      setHealth(h);
      setLatencyMs(Math.round(performance.now() - t0));
    } catch (e) {
      setHealth(null);
      setLatencyMs(null);
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void ping();
  }, [ping]);

  const dbOk = health?.ok && health.database === "connected";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">API health</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/dev/components">Components</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>GET /health</CardTitle>
          <CardDescription>
            Base URL: <code className="text-xs">{env.VITE_API_URL}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" onClick={() => void ping()} disabled={loading}>
            {loading ? "Checking…" : "Ping again"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {health ? (
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Latency</dt>
                <dd>{latencyMs != null ? `${latencyMs} ms` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Service</dt>
                <dd>{health.service}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Database</dt>
                <dd className={dbOk ? "text-emerald-700" : "text-amber-800"}>{health.database ?? "unknown"}</dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
