import { useState, useMemo } from 'react';

import styles from './History.module.css';
import Gauges from '../../ui/Gauges';

import { usePredictionHistory } from '../../../hooks/usePredictionHistory';
import { PREDICTION_SENSOR_CONFIG, PREDICTION_SENSOR_KEYS } from '../../../constants/data';

import type { GaugeData } from '../../../types/charts';
import type { PredictionForecast } from '../../../hooks/usePredictionHistory';

const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getRiskColor = (risk: string): string => {
    switch (risk.toUpperCase()) {
        case 'LOW': return '#82ca9d';
        case 'MEDIUM': return '#ffc658';
        case 'HIGH': return '#ff8042';
        case 'CRITICAL': return '#ff4842';
        default: return '#a0a0a0';
    }
};

const PredictionCard = ({ title, data }: { title: string; data: PredictionForecast }) => (
    <div className={styles.predictionCard}>
        <h3 className={styles.predictionTitle}>{title}</h3>
        <div className={styles.predictionEmoji}>{data.emoji}</div>
        <p className={styles.predictionLabel}>{data.label}</p>
        <div className={styles.predictionMeta}>
            <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Risk</span>
                <span
                    className={styles.riskBadge}
                    style={{ background: getRiskColor(data.risk) }}
                >
                    {data.risk}
                </span>
            </div>
            <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Probability</span>
                <span className={styles.metaValue}>{data.prob_pct}%</span>
            </div>
            <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Threshold</span>
                <span className={styles.metaValue}>{data.threshold}</span>
            </div>
        </div>
    </div>
);

const History = () => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const { entries, availableDates, selectedEntry, loading, error } = usePredictionHistory(
        selectedDate || undefined
    );

    const displayEntries = useMemo(() => {
        return selectedEntry ? [selectedEntry] : entries;
    }, [selectedEntry, entries]);

    const sensorGauges = useMemo<GaugeData[]>(() => {
        if (!displayEntries.length) return [];

        const first = displayEntries[0].sensor;
        return PREDICTION_SENSOR_KEYS.map((key) => {
            const config = PREDICTION_SENSOR_CONFIG[key];
            return {
                name: config.label,
                value: first[key],
                maxValue: config.max,
                color: config.color,
            };
        });
    }, [displayEntries]);

    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>Prediction History</h1>
                <p className={styles.subtitle}>
                    Historical flood prediction data
                </p>
            </section>

            <section className={styles.filterSection}>
                <div className={styles.dateSelector}>
                    <label htmlFor="date-select" className={styles.dateLabel}>
                        Select Date:
                    </label>
                    <div className={styles.dateInputGroup}>
                        <select
                            id="date-select"
                            className={styles.dateSelect}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">All Dates</option>
                            {availableDates.map((date) => (
                                <option key={date} value={date}>
                                    {formatDateForDisplay(date)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedDate && (
                        <button
                            className={styles.clearDateButton}
                            onClick={() => setSelectedDate('')}
                        >
                            Clear Selection
                        </button>
                    )}
                </div>
            </section>

            {loading && (
                <div className={styles.loading}>
                    <p>Loading prediction history...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>Error loading data: {error}</p>
                </div>
            )}

            {!loading && !error && displayEntries.length === 0 && (
                <div className={styles.noData}>
                    <p>No prediction data available.</p>
                </div>
            )}

            {!loading && !error && displayEntries.length > 0 && (
                <>
                    {sensorGauges.length > 0 && (
                        <section className={styles.section}>
                            <Gauges
                                data={sensorGauges}
                                title={selectedDate ? `Sensor Data — ${formatDateForDisplay(selectedDate)}` : 'Latest Sensor Data'}
                            />
                        </section>
                    )}

                    <section className={styles.predictionsGrid}>
                        <PredictionCard
                            title="Forecast"
                            data={displayEntries[0].forecast}
                        />
                        <PredictionCard
                            title="Nowcast"
                            data={displayEntries[0].nowcast}
                        />
                    </section>

                    <section className={styles.historyTable}>
                        <h2 className={styles.tableTitle}>History Records</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Humidity</th>
                                        <th>Rainfall</th>
                                        <th>Temperature</th>
                                        <th>Upstream Rain</th>
                                        <th>Wind Speed</th>
                                        <th>Forecast Risk</th>
                                        <th>Nowcast Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayEntries.map((entry) => (
                                        <tr
                                            key={entry.date}
                                            className={selectedDate === entry.date ? styles.activeRow : ''}
                                            onClick={() => setSelectedDate(entry.date)}
                                        >
                                            <td>{formatDateForDisplay(entry.date)}</td>
                                            <td>{entry.sensor.humidity}%</td>
                                            <td>{entry.sensor.rainfall_mm} mm</td>
                                            <td>{entry.sensor.temperature}°C</td>
                                            <td>{entry.sensor.upstream_rain} mm</td>
                                            <td>{entry.sensor.wind_speed} m/s</td>
                                            <td>
                                                <span
                                                    className={styles.riskBadge}
                                                    style={{ background: getRiskColor(entry.forecast.risk) }}
                                                >
                                                    {entry.forecast.risk}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={styles.riskBadge}
                                                    style={{ background: getRiskColor(entry.nowcast.risk) }}
                                                >
                                                    {entry.nowcast.risk}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default History;