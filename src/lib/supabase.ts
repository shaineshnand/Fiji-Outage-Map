import { createClient } from "@supabase/supabase-js";
import type {
  CommunityReport,
  PlannedOutage,
} from "./types";

export function getSupabasePublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabasePublicKey = getSupabasePublicKey() || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabasePublicKey);

export async function fetchCommunityReports(): Promise<CommunityReport[]> {
  const { data, error } = await supabase
    .from("outages")
    .select("*")
    .order("time_reported", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommunityReport[];
}

export async function fetchPlannedOutages(): Promise<PlannedOutage[]> {
  const { data, error } = await supabase
    .from("planned_outages")
    .select("*")
    .order("start_time", { ascending: false });

  if (error) {
    if (error.code === "PGRST205") return [];
    throw error;
  }
  return (data ?? []) as PlannedOutage[];
}

export async function insertCommunityReport(
  row: Omit<
    CommunityReport,
    "id" | "created_at" | "updated_at" | "status"
  >
): Promise<CommunityReport> {
  const { data, error } = await supabase
    .from("outages")
    .insert({ ...row, status: "active" })
    .select()
    .single();

  if (error) throw error;
  return data as CommunityReport;
}

export async function insertPlannedOutage(
  row: Omit<PlannedOutage, "id" | "created_at" | "updated_at">
): Promise<PlannedOutage> {
  const { data, error } = await supabase
    .from("planned_outages")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as PlannedOutage;
}

export function subscribeToOutageData(onChange: () => void) {
  const channel = supabase
    .channel("outage-intel-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "outages" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "planned_outages" },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** @deprecated */
export const fetchOutages = fetchCommunityReports;
export const insertOutage = insertCommunityReport;
export const subscribeToOutages = subscribeToOutageData;
