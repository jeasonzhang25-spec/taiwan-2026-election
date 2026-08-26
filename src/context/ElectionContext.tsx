"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DisplayMode, ElectionType, FilterState, PartyId } from "@/lib/types";
import { ELECTION_TYPES, DISPLAY_MODES, PARTIES } from "@/lib/constants";
import { SOURCE_OPTIONS } from "@/lib/data/sources";

export const DEFAULT_FILTERS: FilterState = {
  electionType: "mayor",
  date: "",
  party: "all",
  source: "all",
  displayMode: "leading-party",
};

interface DashboardState {
  filters: FilterState;
  countyId: string | null;
}

interface DashboardContextValue {
  filters: FilterState;
  setFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  countyId: string | null;
  openCounty: (id: string) => void;
  closeCounty: () => void;
  hydrated: boolean;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function isValidElectionType(v: string): v is ElectionType {
  return ELECTION_TYPES.some((e) => e.value === v);
}
function isValidMode(v: string): v is DisplayMode {
  return DISPLAY_MODES.some((m) => m.value === v);
}
function isValidParty(v: string): v is PartyId {
  return v in PARTIES;
}
function isValidSource(v: string): boolean {
  return SOURCE_OPTIONS.includes(v);
}

function deserialize(params: URLSearchParams): DashboardState {
  const type = params.get("type") ?? "";
  const party = params.get("party") ?? "all";
  const source = params.get("source") ?? "all";
  const date = params.get("date") ?? "";
  const mode = params.get("mode") ?? "leading-party";
  const county = params.get("county") ?? "";

  return {
    filters: {
      electionType: isValidElectionType(type) ? type : "mayor",
      party: isValidParty(party) ? party : "all",
      source: isValidSource(source) ? source : "all",
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
      displayMode: isValidMode(mode) ? mode : "leading-party",
    },
    countyId: county || null,
  };
}

function serialize(state: DashboardState): Record<string, string> {
  const out: Record<string, string> = {};
  const { filters, countyId } = state;
  if (filters.electionType !== "mayor") out.type = filters.electionType;
  if (filters.party !== "all") out.party = filters.party;
  if (filters.source !== "all") out.source = filters.source;
  if (filters.date) out.date = filters.date;
  if (filters.displayMode !== "leading-party") out.mode = filters.displayMode;
  if (countyId) out.county = countyId;
  return out;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    filters: DEFAULT_FILTERS,
    countyId: null,
  });
  const [hydrated, setHydrated] = useState(false);

  // 掛載後從 URL 讀取（避免 SSR/CSR hydration 不一致）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setState(deserialize(params));
    setHydrated(true);
  }, []);

  // 同步回 URL
  useEffect(() => {
    if (!hydrated) return;
    const obj = serialize(state);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) if (v) params.set(k, v);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [state]);

  const setFilters = useCallback((patch: Partial<FilterState>) => {
    setState((s) => ({ ...s, filters: { ...s.filters, ...patch } }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((s) => ({ ...s, filters: DEFAULT_FILTERS }));
  }, []);

  const openCounty = useCallback((id: string) => {
    setState((s) => ({ ...s, countyId: id }));
  }, []);

  const closeCounty = useCallback(() => {
    setState((s) => ({ ...s, countyId: null }));
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      filters: state.filters,
      setFilters,
      resetFilters,
      countyId: state.countyId,
      openCounty,
      closeCounty,
      hydrated,
    }),
    [state, setFilters, resetFilters, openCounty, closeCounty, hydrated],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard 必須在 DashboardProvider 內使用");
  return ctx;
}
