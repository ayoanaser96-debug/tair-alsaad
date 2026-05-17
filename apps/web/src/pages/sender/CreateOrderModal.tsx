import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CreateOrderForm } from "./CreateOrderForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CreateOrderModal({ open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new order</DialogTitle>
          <DialogDescription className="sr-only">Fill in package and delivery details to submit a new order.</DialogDescription>
        </DialogHeader>
        <CreateOrderForm onSuccess={onSuccess} onClose={() => onOpenChange(false)} variant="modal" />
      </DialogContent>
    </Dialog>
  );
}
