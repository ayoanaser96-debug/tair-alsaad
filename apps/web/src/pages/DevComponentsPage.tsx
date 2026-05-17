import { Package, Star } from "lucide-react";
import { Link } from "react-router-dom";

import {
  AddressDisplay,
  ChartCard,
  DriverCard,
  EmptyState,
  KPICard,
  OrderCard,
  OrderStatusBadge,
  OrderTimeline,
  PageHeader,
  PriceDisplay,
  RatingStars,
  TrackingMap,
  UserCard,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Field } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { tokens } from "@/lib/theme";

export function DevComponentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <PageHeader
        title="Component library QA"
        subtitle="طير السعد (Tair Al Saad) shared UI — primitives, layout, and domain components."
        icon={<Package className="h-8 w-8" />}
      />
      <p className="text-sm text-muted-foreground">
        <Link to="/dashboard/dev/health" className="font-medium text-primary underline-offset-4 hover:underline">
          API health check (GET /health)
        </Link>
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Design tokens</h2>
        <Card>
          <CardContent className="p-4 font-mono text-xs">
            <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(tokens.colors, null, 2)}</pre>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buttons & feedback</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button loading>Loading</Button>
          <Spinner />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Forms</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="demo-input" label="Email" helperText="We never share your email.">
            <Input id="demo-input" placeholder="you@example.com" />
          </Field>
          <Field id="demo-ta" label="Notes" error="This field is required">
            <Textarea id="demo-ta" rows={3} placeholder="…" />
          </Field>
          <SearchInput placeholder="Search…" />
          <DatePicker />
          <DateRangePicker />
          <FileUpload onFilesValidated={() => {}} onError={() => {}} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Order status</h2>
        <div className="flex flex-wrap gap-2">
          {(["PENDING", "ASSIGNED", "DELIVERED", "CANCELLED"] as const).map((s) => (
            <OrderStatusBadge key={s} status={s} />
          ))}
        </div>
        <OrderTimeline status="IN_TRANSIT" timestamps={{ in_transit: new Date().toISOString() }} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <KPICard
          label="Revenue"
          value="MYR 12.4k"
          icon={<Star className="h-4 w-4" />}
          trendPct={5.2}
          vsPreviousLabel="vs previous"
        />
        <UserCard name="Ahmad" email="a@example.com" role="Sender" status="active" />
        <DriverCard name="Raju" rating={4.8} vehicleLabel="Myvi · ABC 1234" phone="+60120001111" />
        <AddressDisplay line="Jalan Example 1" secondary="Kuala Lumpur" />
        <div>
          <PriceDisplay amount={42.5} breakdown={[{ label: "Base", amount: 10 }, { label: "Distance", amount: 32.5 }]} />
        </div>
      </section>

      <OrderCard
        trackingCode="SW-123"
        pickupLabel="KL"
        dropLabel="PJ"
        status="IN_TRANSIT"
        amount={45}
        at={new Date()}
      />

      <ChartCard title="Sample chart" description="Wrapper" empty emptyMessage="No data">
        <div />
      </ChartCard>

      <TrackingMap pickupLabel="Pickup" dropLabel="Drop" driverLabel="Driver nearby" />

      <EmptyState icon={<Package className="h-12 w-12" />} title="Nothing here" description="Create something to get started." />

      <Stepper
        steps={[
          { id: "1", label: "Created" },
          { id: "2", label: "Assigned" },
          { id: "3", label: "Delivered" },
        ]}
        currentIndex={1}
      />

      <Pagination page={2} pageCount={5} onPageChange={() => {}} />

      <RatingStars value={4} onChange={() => {}} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsive</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Resize the viewport to verify mobile patterns.</CardContent>
      </Card>
    </div>
  );
}
