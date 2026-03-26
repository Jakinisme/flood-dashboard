import {
  SOIL_METRIC_CONFIG,
  type SoilMetricKey,
} from "../constants/data";

export const METRIC_KEYS = Object.keys(
  SOIL_METRIC_CONFIG,
) as SoilMetricKey[];

export type SoilMetrics = Record<SoilMetricKey, number>;

export interface SoilMetricSnapshot extends SoilMetrics {
  timestamp: number;
}

export const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const clampMetricValue = (
  value: number | null,
  key: SoilMetricKey,
): number => {
  const { min, max } = SOIL_METRIC_CONFIG[key];
  if (value === null) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export const sanitizeSoilSnapshot = (
  raw: Record<string, unknown> | null,
): SoilMetricSnapshot | null => {
  if (!raw) {
    return null;
  }

  const metrics = METRIC_KEYS.reduce(
    (accumulator, key) => {
      accumulator[key] = clampMetricValue(
        toNumber(raw[key]),
        key,
      );
      return accumulator;
    },
    {} as SoilMetrics,
  );

  const timestamp = toNumber(raw.timestamp) ?? Date.now();

  return {
    ...metrics,
    timestamp,
  };
};






