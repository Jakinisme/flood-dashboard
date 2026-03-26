export const SENSOR_METRIC_CONFIG = {
  humidity: {
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100,
    color: "#174dffcb",
  },
  rainfall_mm: {
    label: "Rainfall",
    unit: "mm",
    min: 0,
    max: 500,
    color: "#00c49f",
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 50,
    color: "#ffc658",
  },
  upstream_rain: {
    label: "Upstream Rain",
    unit: "mm",
    min: 0,
    max: 100,
    color: "#8884d8",
  },
  wind_speed: {
    label: "Wind Speed",
    unit: "m/s",
    min: 0,
    max: 30,
    color: "#baffff",
  },
} as const;

export type SensorMetricKey = keyof typeof SENSOR_METRIC_CONFIG;
export const SENSOR_METRIC_KEYS = Object.keys(SENSOR_METRIC_CONFIG) as SensorMetricKey[];

export const SENSOR_RTDB_PATHS = {
  latest: "sensor_data/latest",
  history: "sensor_data/history",
} as const;

export const PREDICTION_RTDB_PATHS = {
  history: "predictions/history",
} as const;

export const PREDICTION_SENSOR_CONFIG = SENSOR_METRIC_CONFIG;
export type PredictionSensorKey = SensorMetricKey;
export const PREDICTION_SENSOR_KEYS = SENSOR_METRIC_KEYS;
