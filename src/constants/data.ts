export const SOIL_METRIC_CONFIG = {
  humidity: {
    label: "Relative Humidity",
    unit: "%",
    min: 0,
    max: 100,
    color: "#174dffcb",
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 100,
    color: "#ffc658",
  },
  wind: {
    label: "Wind Speed",
    unit: "m/s",
    min: 0,
    max: 30,
    color: "#baffff",
  },
  rainfall : {
    label: "Rainfall",
    unit: "mm/ml",
    min: 0,
    max: 500,
    color: "#00c49f",
  }
} as const;

export type SoilMetricKey = keyof typeof SOIL_METRIC_CONFIG;

export const SOIL_RTDB_PATHS = {
  current: "soil/current",
  history: "soil/history",
  weekly: "soil/weekly",
  monthly: "soil/monthly",
} as const;






