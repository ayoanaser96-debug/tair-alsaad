import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  showNumbers?: boolean;
};

export function Pagination({ page, pageCount, onPageChange, className, showNumbers = true }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  const nums = React.useMemo(() => {
    if (!showNumbers || pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const items: (number | "ellipsis")[] = [];
    if (page <= 3) {
      items.push(1, 2, 3, 4, "ellipsis", pageCount);
    } else if (page >= pageCount - 2) {
      items.push(1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount);
    } else {
      items.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount);
    }
    return items;
  }, [page, pageCount, showNumbers]);

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-1", className)} aria-label="Pagination">
      <Button type="button" variant="outline" size="icon" disabled={!canPrev} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {showNumbers
        ? nums.map((n, i) =>
            n === "ellipsis" ? (
              <span key={`e-${i}`} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={n}
                type="button"
                variant={n === page ? "default" : "ghost"}
                size="sm"
                className="min-w-9"
                onClick={() => onPageChange(n)}
              >
                {n}
              </Button>
            ),
          )
        : null}
      <Button type="button" variant="outline" size="icon" disabled={!canNext} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
