import { Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  onClear?: () => void;
  /** Required for a11y when `onClear` is set (e.g. pass `t('sender.dashboard.orders.searchClearAria')`). */
  clearAriaLabel?: string;
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, clearAriaLabel, ...props }, ref) => {
    const v = value ?? "";
    const showClear = typeof v === "string" && v.length > 0 && onClear;

    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input ref={ref} type="search" className={cn("ps-9", showClear && "pe-10")} value={value} {...props} />
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute end-0.5 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={onClear}
            aria-label={clearAriaLabel ?? "Clear search"}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
