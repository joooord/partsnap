"use client";

import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobalPrice } from "@/lib/types";

interface Props {
  results: GlobalPrice[];
  loading: boolean;
}

export function PriceComparison({ results, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-border pb-6">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">
          No prices found. Try a manual search.
        </p>
      </div>
    );
  }

  const hasRealPrices = results.some((r) => r.unitPrice > 0);

  return (
    <div>
      {hasRealPrices && (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Sorted by lowest price
        </p>
      )}

      <div className="divide-y divide-border">
        {results.map((price, i) => {
          const isCheapest = i === 0 && hasRealPrices && price.unitPrice > 0;

          return (
            <div key={i} className="py-5 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {price.supplier}
                    </span>
                    {isCheapest && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                        Best Price
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold leading-snug line-clamp-2">
                    {price.productName}
                  </p>

                  {price.unitPrice > 0 && (
                    <p className="text-lg font-black mt-1">
                      {price.currency === "GBP" ? "\u00a3" : price.currency}
                      {price.unitPrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {price.imageUrl && (
                  <img
                    src={price.imageUrl}
                    alt={price.productName}
                    className="w-14 h-14 object-cover bg-muted shrink-0"
                  />
                )}
              </div>

              <a
                href={price.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors ${
                  isCheapest
                    ? "bg-black text-white hover:bg-black/80"
                    : "border border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                {price.unitPrice > 0 ? "Buy Now" : "Search"}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
