import {
  SENSOR_METRIC_CONFIG,
  type SensorMetricKey,
} from "../constants/data";

export const METRIC_KEYS = Object.keys(
  SENSOR_METRIC_CONFIG,
) as SensorMetricKey[];

export type SensorMetrics = Record<SensorMetricKey, number>;

export interface SensorMetricSnapshot extends SensorMetrics {
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
  key: SensorMetricKey,
): number => {
  const { min, max } = SENSOR_METRIC_CONFIG[key];
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

export const sanitizeSensorSnapshot = (
  raw: Record<string, unknown> | null,
): SensorMetricSnapshot | null => {
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
    {} as SensorMetrics,
  );

  const timestamp = toNumber(raw.timestamp) ?? Date.now();

  return {
    ...metrics,
    timestamp,
  };
};
