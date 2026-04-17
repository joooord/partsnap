"use client";

import { ExternalLink, Search } from "lucide-react";
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
          No matching searches built. Open Accu directly:
        </p>
        <a
          href="https://www.accu.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 hover:text-gold transition-colors"
        >
          Accu.co.uk
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
        Pre-filtered Accu searches &middot; refine in Accu&apos;s catalogue
      </p>

      <div className="divide-y divide-border">
        {results.map((product, i) => {
          const isPrimary = i === 0;
          const hasPrice = product.priceTiers.length > 0;
          const specEntries = Object.entries(product.specs).slice(0, 5);

          return (
            <div key={i} className="py-5 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isPrimary ? "text-gold" : "text-muted-foreground"}`}
                    >
                      {isPrimary ? "Best match" : `Broader match`}
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

                  {hasPrice && (
                    <p className="text-lg font-black mt-2">
                      &pound;{product.priceTiers[0].unitPrice.toFixed(2)}
                      {product.priceTiers.length > 1 && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          from &pound;
                          {product.priceTiers[
                            product.priceTiers.length - 1
                          ].unitPrice.toFixed(2)}{" "}
                          at qty{" "}
                          {product.priceTiers[product.priceTiers.length - 1].qty}
                        </span>
                      )}
                    </p>
                  )}

                  {isPrimary && specEntries.length > 0 && (
                    <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      {specEntries.map(([k, v]) => (
                        <li key={k} className="flex justify-between gap-2">
                          <span className="text-muted-foreground uppercase tracking-[0.08em]">
                            {k}
                          </span>
                          <span className="font-semibold text-right truncate">
                            {v}
                          </span>
                        </li>
                      ))}
                    </ul>
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
                className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors ${
                  isPrimary
                    ? "bg-black text-white hover:bg-gold hover:text-black"
                    : "border border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                {hasPrice ? "Buy on Accu" : "Search on Accu"}
                {hasPrice ? (
                  <ExternalLink className="w-3 h-3" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
