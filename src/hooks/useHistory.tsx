import { useEffect, useMemo, useState } from "react";

import { onValue, ref } from "firebase/database";
import { database } from "../services/Firebase";

import type { GraphData } from "../types/charts";

import { SENSOR_METRIC_CONFIG, SENSOR_RTDB_PATHS } from "../constants/data";
import {
  METRIC_KEYS,
  sanitizeSensorSnapshot,
  type SensorMetricSnapshot,
} from "../utils/soil";

interface SensorHistoryEntry extends SensorMetricSnapshot {
  key: string;
  label: string;
}

interface UseHistoryResult {
  history: SensorHistoryEntry[];
  graph: GraphData;
  loading: boolean;
  error: string | null;
}

const DEFAULT_GRAPH: GraphData = {
  data: [],
  dataKeys: METRIC_KEYS,
  colors: METRIC_KEYS.map((key) => SENSOR_METRIC_CONFIG[key].color),
};

export const useHistory = (selectedDate?: string): UseHistoryResult => {
  const [history, setHistory] = useState<SensorHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const path = selectedDate
      ? `${SENSOR_RTDB_PATHS.history}/${selectedDate}`
      : SENSOR_RTDB_PATHS.history;

    const historyRef = ref(database, path);

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const rawData = snapshot.val();

        if (!rawData) {
          setHistory([]);
          setError(null);
          setLoading(false);
          return;
        }

        let entries: SensorHistoryEntry[] = [];

        if (selectedDate) {
          const sanitized = sanitizeSensorSnapshot(rawData as Record<string, unknown>);

          if (sanitized) {
            const date = new Date(selectedDate);

            entries.push({
              key: selectedDate,
              label: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              ...sanitized,
              timestamp: sanitized.timestamp || date.getTime(),
            });
          }
        } else {
          const rawHistory = rawData as Record<string, Record<string, unknown>> | null;

          if (rawHistory) {
            entries = Object.entries(rawHistory).reduce<SensorHistoryEntry[]>(
              (accumulator, [dateKey, value]) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                  return accumulator;
                }

                const sanitized = sanitizeSensorSnapshot(value);
                if (sanitized) {
                  const date = new Date(dateKey);

                  accumulator.push({
                    key: dateKey,
                    label: date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                    ...sanitized,
                    timestamp: sanitized.timestamp || date.getTime(),
                  });
                }
                return accumulator;
              },
              [],
            );
          }
        }

        entries.sort((a, b) => a.timestamp - b.timestamp);

        setHistory(entries);
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
  }, [selectedDate]);

  const graph = useMemo<GraphData>(() => {
    if (!history.length) {
      return DEFAULT_GRAPH;
    }

    const data = history.map((entry) => ({
      timestamp: entry.timestamp,
      label: entry.label,
      humidity: entry.humidity,
      rainfall_mm: entry.rainfall_mm,
      temperature: entry.temperature,
      upstream_rain: entry.upstream_rain,
      wind_speed: entry.wind_speed,
    }));

    return {
      data,
      dataKeys: METRIC_KEYS,
      colors: METRIC_KEYS.map((key) => SENSOR_METRIC_CONFIG[key].color),
    };
  }, [history]);

  return {
    history,
    graph,
    loading,
    error,
  };
};
