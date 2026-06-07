/**
 * Intelligence layer: confidence score (0–100) from report count in a cluster.
 *
 * | Reports | Confidence |
 * |---------|------------|
 * | 1       | 20%        |
 * | 3       | 55%        |
 * | 5+      | 85%        |
 */

export function confidenceFromReportCount(count: number): number {
  if (count <= 0) return 0;
  if (count >= 5) return 85;
  if (count >= 3) return 55;
  if (count === 2) return 38;
  return 20;
}

/** Red zone (active reported) vs orange (unconfirmed) */
export const CONFIDENCE_ACTIVE_THRESHOLD = 55;

export function layerFromConfidence(
  confidence: number,
  isCleared: boolean
): "active_reported" | "unconfirmed" | "cleared" {
  if (isCleared) return "cleared";
  if (confidence >= CONFIDENCE_ACTIVE_THRESHOLD) return "active_reported";
  return "unconfirmed";
}
