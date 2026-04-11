"use client";

import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AccuProduct } from "@/lib/types";

interface Props {
  results: AccuProduct[];
  loading: boolean;
}

export function AccuMatchResults({ results, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border pb-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-3" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground mb-4">
          No matching products found on Accu.
        </p>
        <a
          href="https://www.accu.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 hover:text-gold transition-colors"
        >
          Search Accu Manually
        </a>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {results.map((product, i) => (
        <div key={i} className="py-5 first:pt-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                  {product.matchConfidence} match
                </span>
                {product.stockStatus === "in_stock" && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-700">
                    In Stock
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold leading-snug line-clamp-2">
                {product.name}
              </h4>

              {product.priceTiers.length > 0 && (
                <p className="text-lg font-black mt-2">
                  &pound;{product.priceTiers[0].unitPrice.toFixed(2)}
                  {product.priceTiers.length > 1 && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      from &pound;
                      {product.priceTiers[product.priceTiers.length - 1].unitPrice.toFixed(2)}
                      {" "}at qty {product.priceTiers[product.priceTiers.length - 1].qty}
                    </span>
                  )}
                </p>
              )}
            </div>

            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 object-cover bg-muted shrink-0"
              />
            )}
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-wider bg-black text-white px-5 py-2.5 hover:bg-black/80 transition-colors"
          >
            View on Accu
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ))}
    </div>
  );
}
