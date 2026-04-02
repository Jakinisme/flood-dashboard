import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../services/Firebase";
import { PREDICTION_RTDB_PATHS } from "../constants/data";
import type { PredictionForecast } from "./usePredictionHistory";

interface UseLatestPredictionResult {
  forecast: PredictionForecast | null;
  nowcast: PredictionForecast | null;
  loading: boolean;
  error: string | null;
}

const parsePrediction = (raw: Record<string, unknown>): PredictionForecast => ({
  emoji: String(raw?.emoji ?? ""),
  label: String(raw?.label ?? ""),
  prob: Number(raw?.prob ?? 0),
  prob_pct: Number(raw?.prob_pct ?? 0),
  risk: String(raw?.risk ?? "UNKNOWN"),
  threshold: Number(raw?.threshold ?? 0),
});

export const useLatestPrediction = (): UseLatestPredictionResult => {
  const [forecast, setForecast] = useState<PredictionForecast | null>(null);
  const [nowcast, setNowcast] = useState<PredictionForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const latestRef = ref(database, PREDICTION_RTDB_PATHS.latest);

    const unsubscribe = onValue(
      latestRef,
      (snapshot) => {
        const rawData = snapshot.val() as Record<string, unknown> | null;

        if (!rawData) {
          setForecast(null);
          setNowcast(null);
          setError(null);
          setLoading(false);
          return;
        }

        const rawForecast = (rawData.forecast as Record<string, unknown>) ?? {};
        const rawNowcast = (rawData.nowcast as Record<string, unknown>) ?? {};

        setForecast(parsePrediction(rawForecast));
        setNowcast(parsePrediction(rawNowcast));
        setError(null);
        setLoading(false);
      },
      (firebaseError) => {
        setError(firebaseError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { forecast, nowcast, loading, error };
};
