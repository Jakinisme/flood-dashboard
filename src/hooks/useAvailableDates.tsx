import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../services/Firebase";
import { SOIL_RTDB_PATHS } from "../constants/data";

interface UseAvailableDatesResult {
  dates: string[];
  loading: boolean;
  error: string | null;
}

export const useAvailableDates = (): UseAvailableDatesResult => {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const historyRef = ref(database, SOIL_RTDB_PATHS.history);

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const rawHistory = snapshot.val() as Record<string, unknown> | null;

        if (!rawHistory) {
          setDates([]);
          setError(null);
          setLoading(false);
          return;
        }

        const dateKeys = Object.keys(rawHistory).filter((key) => {
          return /^\d{2}-\d{2}-\d{4}$/.test(key);
        });

        dateKeys.sort((a, b) => {
          const [dayA, monthA, yearA] = a.split("-").map(Number);
          const [dayB, monthB, yearB] = b.split("-").map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateB.getTime() - dateA.getTime();
        });

        setDates(dateKeys);
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

  return {
    dates,
    loading,
    error,
  };
};




