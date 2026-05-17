import { useCallback, useState } from "react";

export type ConfirmConfig = {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  const openConfirm = useCallback((c: ConfirmConfig) => {
    setConfig(c);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setConfig(null);
  }, []);

  return { open, config, openConfirm, close };
}
