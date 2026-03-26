import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../services/Firebase";
import { PREDICTION_RTDB_PATHS } from "../constants/data";

export interface PredictionSensor {
    humidity: number;
    rainfall_mm: number;
    temperature: number;
    upstream_rain: number;
    wind_speed: number;
    timestamp: number;
}

export interface PredictionForecast {
    emoji: string;
    label: string;
    prob: number;
    prob_pct: number;
    risk: string;
    threshold: number;
}

export interface PredictionEntry {
    date: string;
    sensor: PredictionSensor;
    forecast: PredictionForecast;
    nowcast: PredictionForecast;
}

interface UsePredictionHistoryResult {
    entries: PredictionEntry[];
    availableDates: string[];
    selectedEntry: PredictionEntry | null;
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

const parseSensor = (raw: Record<string, unknown>): PredictionSensor => ({
    humidity: Number(raw?.humidity ?? 0),
    rainfall_mm: Number(raw?.rainfall_mm ?? 0),
    temperature: Number(raw?.temperature ?? 0),
    upstream_rain: Number(raw?.upstream_rain ?? 0),
    wind_speed: Number(raw?.wind_speed ?? 0),
    timestamp: Number(raw?.timestamp ?? 0),
});

export const usePredictionHistory = (selectedDate?: string): UsePredictionHistoryResult => {
    const [entries, setEntries] = useState<PredictionEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const historyRef = ref(database, PREDICTION_RTDB_PATHS.history);

        const unsubscribe = onValue(
            historyRef,
            (snapshot) => {
                const rawData = snapshot.val() as Record<string, Record<string, unknown>> | null;

                if (!rawData) {
                    setEntries([]);
                    setError(null);
                    setLoading(false);
                    return;
                }

                const parsed: PredictionEntry[] = Object.entries(rawData)
                    .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
                    .map(([key, value]) => ({
                        date: String(value.date ?? key),
                        sensor: parseSensor((value.sensor as Record<string, unknown>) ?? {}),
                        forecast: parsePrediction((value.forecast as Record<string, unknown>) ?? {}),
                        nowcast: parsePrediction((value.nowcast as Record<string, unknown>) ?? {}),
                    }))
                    .sort((a, b) => b.date.localeCompare(a.date));

                setEntries(parsed);
                setError(null);
                setLoading(false);
            },
            (firebaseError) => {
                setError(firebaseError.message);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    const availableDates = entries.map((e) => e.date);

    const selectedEntry = selectedDate
        ? entries.find((e) => e.date === selectedDate) ?? null
        : null;

    return {
        entries,
        availableDates,
        selectedEntry,
        loading,
        error,
    };
};
