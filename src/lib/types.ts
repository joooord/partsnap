export type PartCategory =
  | "fastener"
  | "nut_washer"
  | "pin_shaft"
  | "standoff_spacer"
  | "insert_rivet"
  | "knob_handle_lever"
  | "hinge_latch"
  | "spring"
  | "circlip_clip"
  | "magnet"
  | "bearing_bushing"
  | "o_ring_seal"
  | "cable_gland_grommet"
  | "levelling_foot"
  | "shaft_collar"
  | "threaded_rod"
  | "tool_key"
  | "other"
  | "not_a_part";

export interface PartIdentification {
  /** Broad catalogue category (drives the Accu search path). */
  category: PartCategory;
  /** Specific part type, free-form - e.g. "M5 socket cap screw", "star knob", "neodymium pot magnet", "piano hinge". */
  partType: string;
  /** Human-readable display name. */
  name: string;
  confidence: "high" | "medium" | "low";
  /** Fastener-centric structured specs. All nullable - non-fasteners may leave most blank. */
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
  /** Free-form spec bag for non-fastener attributes (e.g. { "outer diameter": "20mm", "magnet grade": "N35", "hinge leaf width": "40mm" }). */
  attributes: Record<string, string>;
  /** 3-5 search queries, most specific first. Used to build Accu search URLs. */
  searchTerms: string[];
  reasoning: string;
  /** When category is "not_a_part", a cheeky roast about whatever was actually photographed. Null otherwise. */
  joke: string | null;
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
