"use client";

import { useReducer, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";
import { LoadingScanner } from "@/components/loading-scanner";
import { PartIdentityCard } from "@/components/part-identity-card";
import { AccuMatchResults } from "@/components/accu-match-card";
import { PriceComparison } from "@/components/price-comparison";
import type {
  AppState,
  PartIdentification,
  AccuProduct,
  GlobalPrice,
} from "@/lib/types";

type Action =
  | { type: "START_IDENTIFY"; imageData: string }
  | { type: "IDENTIFY_SUCCESS"; identification: PartIdentification }
  | { type: "ACCU_SUCCESS"; results: AccuProduct[] }
  | { type: "GLOBAL_SUCCESS"; results: GlobalPrice[] }
  | { type: "ACCU_ERROR" }
  | { type: "GLOBAL_ERROR" }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

const initialState: AppState = {
  stage: "capture",
  imageData: null,
  identification: null,
  accuResults: [],
  globalResults: [],
  accuLoading: false,
  globalLoading: false,
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "START_IDENTIFY":
      return {
        ...initialState,
        stage: "identifying",
        imageData: action.imageData,
      };
    case "IDENTIFY_SUCCESS":
      return {
        ...state,
        identification: action.identification,
        stage: "results",
        accuLoading: true,
        globalLoading: true,
      };
    case "ACCU_SUCCESS":
      return { ...state, accuResults: action.results, accuLoading: false };
    case "GLOBAL_SUCCESS":
      return { ...state, globalResults: action.results, globalLoading: false };
    case "ACCU_ERROR":
      return { ...state, accuLoading: false };
    case "GLOBAL_ERROR":
      return { ...state, globalLoading: false };
    case "ERROR":
      return { ...state, stage: "error", error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleCapture = useCallback(async (base64: string) => {
    dispatch({ type: "START_IDENTIFY", imageData: base64 });

    try {
      const idRes = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!idRes.ok) {
        const err = await idRes.json();
        throw new Error(err.error || "Identification failed");
      }

      const identification: PartIdentification = await idRes.json();
      dispatch({ type: "IDENTIFY_SUCCESS", identification });

      const searchAccu = fetch("/api/search-accu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identification),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            dispatch({
              type: "ACCU_SUCCESS",
              results: Array.isArray(data) ? data : [],
            });
          } else {
            dispatch({ type: "ACCU_ERROR" });
          }
        })
        .catch(() => dispatch({ type: "ACCU_ERROR" }));

      const searchGlobal = fetch("/api/search-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identification),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            dispatch({
              type: "GLOBAL_SUCCESS",
              results: Array.isArray(data) ? data : [],
            });
          } else {
            dispatch({ type: "GLOBAL_ERROR" });
          }
        })
        .catch(() => dispatch({ type: "GLOBAL_ERROR" }));

      await Promise.all([searchAccu, searchGlobal]);
    } catch (error) {
      dispatch({
        type: "ERROR",
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] uppercase">
              Partsnap
            </h1>
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mt-0.5">
              Snap &middot; Identify &middot; Buy
            </p>
          </div>
          {state.stage !== "capture" && (
            <button
              className="text-xs font-semibold uppercase tracking-wider border-b border-black pb-0.5 hover:text-gold transition-colors"
              onClick={() => dispatch({ type: "RESET" })}
            >
              New Scan
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10">
        {state.stage === "capture" && (
          <CameraCapture onCapture={handleCapture} />
        )}

        {state.stage === "identifying" && state.imageData && (
          <LoadingScanner imageData={state.imageData} stage="identifying" />
        )}

        {state.stage === "results" &&
          state.identification &&
          state.imageData && (
            <div className="space-y-8">
              <Tabs defaultValue="identify" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-black p-0 h-auto gap-0">
                  <TabsTrigger
                    value="identify"
                    className="text-xs font-bold uppercase tracking-wider pb-3 border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent text-muted-foreground"
                  >
                    Identified
                  </TabsTrigger>
                  <TabsTrigger
                    value="accu"
                    className="text-xs font-bold uppercase tracking-wider pb-3 border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent text-muted-foreground"
                  >
                    Accu
                    {state.accuLoading && (
                      <span className="ml-2 w-1.5 h-1.5 bg-gold inline-block" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="global"
                    className="text-xs font-bold uppercase tracking-wider pb-3 border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent text-muted-foreground"
                  >
                    Best Price
                    {state.globalLoading && (
                      <span className="ml-2 w-1.5 h-1.5 bg-gold inline-block" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="identify" className="mt-8">
                  <PartIdentityCard
                    identification={state.identification}
                    imageData={state.imageData}
                  />
                </TabsContent>

                <TabsContent value="accu" className="mt-8">
                  <AccuMatchResults
                    results={state.accuResults}
                    loading={state.accuLoading}
                  />
                </TabsContent>

                <TabsContent value="global" className="mt-8">
                  <PriceComparison
                    results={state.globalResults}
                    loading={state.globalLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

        {state.stage === "error" && (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Failed
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {state.error}
            </p>
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="text-sm font-bold uppercase tracking-wider bg-black text-white px-8 py-3 hover:bg-black/80 transition-colors"
            >
              Try Again
            </button>
            <p className="text-[11px] text-muted-foreground tracking-wide">
              Use good lighting, plain background, sharp focus
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black py-5">
        <p className="text-center text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">
          Partsnap &mdash; AI-Powered Part Identification
        </p>
      </footer>
    </div>
  );
}
