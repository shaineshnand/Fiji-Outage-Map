export function formatReportTime(iso: string): string {
  return new Intl.DateTimeFormat("en-FJ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Pacific/Fiji",
  }).format(new Date(iso));
}

export function sourceLabel(source: "user_report" | "manual"): string {
  switch (source) {
    case "user_report":
      return "Community report";
    case "manual":
      return "Manual";
  }
}

export function issueLabel(issue: "no_power" | "partial_outage"): string {
  return issue === "partial_outage" ? "Partial outage" : "No power";
}
