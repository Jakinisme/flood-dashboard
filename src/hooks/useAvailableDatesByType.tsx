import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../services/Firebase";
import { SOIL_RTDB_PATHS } from "../constants/data";

type DataType = 'daily' | 'weekly' | 'monthly';

interface UseAvailableDatesByTypeResult {
  dates: string[];
  loading: boolean;
  error: string | null;
}

const getPathForDataType = (dataType: DataType): string => {
  switch (dataType) {
    case 'daily':
      return SOIL_RTDB_PATHS.history;
    case 'weekly':
      return SOIL_RTDB_PATHS.weekly;
    case 'monthly':
      return SOIL_RTDB_PATHS.monthly;
  }
};

export const useAvailableDatesByType = (dataType: DataType): UseAvailableDatesByTypeResult => {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const path = getPathForDataType(dataType);
    const datesRef = ref(database, path);

    const unsubscribe = onValue(
      datesRef,
      (snapshot) => {
        const rawData = snapshot.val() as Record<string, unknown> | null;

        if (!rawData) {
          setDates([]);
          setError(null);
          setLoading(false);
          return;
        }

        const dateKeys = Object.keys(rawData).filter((key) => {
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
  }, [dataType]);

  return {
    dates,
    loading,
    error,
  };
};




