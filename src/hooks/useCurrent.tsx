import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";

import type { GaugeData, GraphData, GraphDataPoint } from "../types/charts";
import { database } from "../services/Firebase";
import {
  SENSOR_METRIC_CONFIG,
  SENSOR_RTDB_PATHS,
  type SensorMetricKey,
} from "../constants/data";
import type { SensorMetricSnapshot } from "../utils/soil";
import {
  METRIC_KEYS,
  sanitizeSensorSnapshot,
} from "../utils/soil";

interface UseCurrentResult {
  current: SensorMetricSnapshot | null;
  gauges: GaugeData[];
  graph: GraphData;
  loading: boolean;
  error: string | null;
}

const EMPTY_GRAPH: GraphData = {
  data: [],
  dataKeys: METRIC_KEYS,
  colors: METRIC_KEYS.map((key) => SENSOR_METRIC_CONFIG[key].color),
};

const MAX_GRAPH_POINTS = 10;

export const useCurrent = (): UseCurrentResult => {
  const [current, setCurrent] = useState<SensorMetricSnapshot | null>(null);
  const [graphEntries, setGraphEntries] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentRef = ref(database, SENSOR_RTDB_PATHS.latest);

    const unsubscribe = onValue(
      currentRef,
      (snapshot) => {
        const sanitized = sanitizeSensorSnapshot(snapshot.val());
        if (sanitized) {
          const pointTimestamp = Date.now();

          const normalizedEntry: Record<SensorMetricKey, number> = {} as Record<
            SensorMetricKey,
            number
          >;

          METRIC_KEYS.forEach((key) => {
            const { max } = SENSOR_METRIC_CONFIG[key];
            const value = (sanitized[key] / max) * 100;
            normalizedEntry[key] = Number.isFinite(value)
              ? Number(value.toFixed(2))
              : 0;
          });

          const label = new Date(pointTimestamp).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            },
          );

          const nextPoint: GraphDataPoint = {
            timestamp: pointTimestamp,
            label,
            ...normalizedEntry,
          };

          setGraphEntries((previous) => {
            const nextEntries = [...previous];

            const existingIndex = nextEntries.findIndex(
              (point) => point.timestamp === nextPoint.timestamp,
            );

            if (existingIndex >= 0) {
              const existing = nextEntries[existingIndex];
              const hasChanges = METRIC_KEYS.some(
                (key) => existing[key] !== nextPoint[key],
              );

              if (!hasChanges && existing.label === nextPoint.label) {
                return previous;
              }

              nextEntries[existingIndex] = nextPoint;
            } else {
              nextEntries.push(nextPoint);
            }

            nextEntries.sort((a, b) => a.timestamp - b.timestamp);

            if (nextEntries.length > MAX_GRAPH_POINTS) {
              return nextEntries.slice(nextEntries.length - MAX_GRAPH_POINTS);
            }

            return nextEntries;
          });

          const sanitizedWithCurrentTimestamp: SensorMetricSnapshot = {
            ...sanitized,
            timestamp: pointTimestamp,
          };

          setCurrent(sanitizedWithCurrentTimestamp);
        } else {
          setCurrent(null);
        }

        setError(null);
        setLoading(false);
      },
      (firebaseError) => {
        setError(firebaseError.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const gauges = useMemo<GaugeData[]>(() => {
    if (!current) {
      return [];
    }

    return METRIC_KEYS.map((key) => ({
      name: SENSOR_METRIC_CONFIG[key].label,
      value: current[key],
      maxValue: SENSOR_METRIC_CONFIG[key].max,
      color: SENSOR_METRIC_CONFIG[key].color,
    }));
  }, [current]);

  const graph = useMemo<GraphData>(() => {
    if (!graphEntries.length) {
      return EMPTY_GRAPH;
    }

    return {
      data: graphEntries,
      dataKeys: METRIC_KEYS,
      colors: METRIC_KEYS.map((key) => SENSOR_METRIC_CONFIG[key].color),
    };
  }, [graphEntries]);

  return {
    current,
    gauges,
    graph,
    loading,
    error,
  };
};
