export interface PartIdentification {
  partType:
    | "screw"
    | "bolt"
    | "nut"
    | "washer"
    | "standoff"
    | "rivet"
    | "pin"
    | "spacer"
    | "insert"
    | "spring"
    | "clip"
    | "anchor"
    | "other";
  name: string;
  confidence: "high" | "medium" | "low";
  specs: {
    threadSize: string | null;
    threadPitch: string | null;
    length: string | null;
    diameter: string | null;
    headType: string | null;
    driveType: string | null;
    material: string | null;
    finish: string | null;
    standard: string | null;
  };
  searchTerms: string[];
  reasoning: string;
}

export interface AccuProduct {
  name: string;
  url: string;
  imageUrl: string | null;
  specs: Record<string, string>;
  priceTiers: { qty: number; unitPrice: number }[];
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  matchConfidence: "exact" | "close" | "approximate";
}

export interface GlobalPrice {
  supplier: string;
  productName: string;
  productUrl: string;
  unitPrice: number;
  currency: string;
  imageUrl: string | null;
  source: string;
}

export type AppStage = "capture" | "identifying" | "results" | "error";

export interface AppState {
  stage: AppStage;
  imageData: string | null;
  identification: PartIdentification | null;
  accuResults: AccuProduct[];
  globalResults: GlobalPrice[];
  accuLoading: boolean;
  globalLoading: boolean;
  error: string | null;
}
