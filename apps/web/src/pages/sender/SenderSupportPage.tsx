import { HelpCircle, Mail, MessageSquare } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SenderSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Support & help</h1>
        <p className="text-sm text-muted-foreground">Get answers about deliveries, billing, and your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              FAQs
            </CardTitle>
            <CardDescription>Common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">How do I track my package?</strong> Open the sender dashboard and click your
              tracking ID for full timeline and driver details.
            </p>
            <p>
              <strong className="text-foreground">Can I cancel after pickup?</strong> Cancellations are only allowed before
              the driver picks up your parcel.
            </p>
            <p>
              <strong className="text-foreground">Pricing</strong> Estimates update live as you fill the create-order form
              based on size, weight, declared value, and delivery window.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" />
              Contact
            </CardTitle>
            <CardDescription>We typically reply within one business day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <a href="mailto:support@smartgateapp.com" className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="h-4 w-4" />
              support@smartgateapp.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
