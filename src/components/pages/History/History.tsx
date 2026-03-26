import { useMemo, useState } from 'react';

import styles from './History.module.css';
import Gauges from '../../ui/Gauges';
import StatusItem from './sections/StatusItem';

import { useHistory } from '../../../hooks/useHistory';
import { useAvailableDatesByType } from '../../../hooks/useAvailableDatesByType';

import { SOIL_METRIC_CONFIG } from '../../../constants/data';
import { METRIC_KEYS } from '../../../utils/soil';

import type { GaugeData } from '../../../types/charts';

type DataType = 'daily' | 'weekly' | 'monthly';

const formatDateForDisplay = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const History = () => {
    const [dataType, setDataType] = useState<DataType>('daily');
    const { dates: availableDates, loading: datesLoading } = useAvailableDatesByType(dataType);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const { history, loading, error } = useHistory(selectedDate || undefined, dataType);
    const [dateInput, setDateInput] = useState('');

    const averageGauges = useMemo<GaugeData[]>(() => {
        if (!history.length) {
            return [];
        }

        const averages = METRIC_KEYS.map((key) => {
            const sum = history.reduce((acc, entry) => acc + entry[key], 0);
            const average = sum / history.length;
            const config = SOIL_METRIC_CONFIG[key];

            return {
                name: config.label,
                value: Math.round(average * 100) / 100,
                maxValue: config.max,
                color: config.color,
            };
        });

        return averages;
    }, [history]);

    const averageDetection = useMemo(() => {
        if (!history.length) {
            return {
                totalDetections: 0,
                averageConfidence: 0,
                healthStatus: {
                    healthy: 0,
                    diseased: 0,
                    warning: 0,
                },
            };
        }

        const totalDetections = history.length;
        
        const validDetections = history.filter(
            (entry) => entry.moisture > 0 && entry.temperature > 0 && entry.light > 0
        );
        
        const averageConfidence = totalDetections > 0 
            ? (validDetections.length / totalDetections) * 100 
            : 0;

        const healthStatus = history.reduce(
            (acc, entry) => {
                if (entry.moisture > 30) {
                    acc.healthy++;
                    return acc;
                }
                
                if (entry.moisture < 20) {
                    acc.diseased++;
                    return acc;
                }
                
                acc.warning++;
                return acc;
            },
            { healthy: 0, diseased: 0, warning: 0 }
        );

        return {
            totalDetections,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            healthStatus,
        };
    }, [history]);

    const detectionGauges: GaugeData[] = useMemo(() => {
        const { totalDetections, averageConfidence, healthStatus } = averageDetection;
        const totalHealth = healthStatus.healthy + healthStatus.diseased + healthStatus.warning;

        return [
            {
                name: 'Total Detections',
                value: totalDetections,
                maxValue: Math.max(totalDetections, 6),
                color: '#8884d8',
            },
            {
                name: 'Avg Confidence',
                value: averageConfidence,
                maxValue: 100,
                color: '#82ca9d',
            },
            {
                name: 'Healthy Plants',
                value: healthStatus.healthy,
                maxValue: totalHealth || 6,
                color: '#82ca9d',
            },
            {
                name: 'Diseased Plants',
                value: healthStatus.diseased,
                maxValue: totalHealth || 6,
                color: '#ff4842',
            },
        ];
    }, [averageDetection]);

    const getFilterTitle = () => {
        const dataTypeLabel = dataType === 'daily' ? 'Daily' : dataType === 'weekly' ? 'Weekly' : 'Monthly';
        return `${dataTypeLabel} Average Data`;
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setDateInput('');
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parts = value.split('-');
        let dateStr = '';

        setDateInput(value);
    
        if (parts[0].length === 4) {
            dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
            dateStr = value;
        }

        if (value.length !== 10 || !value.includes('-') || value.split('-').length !== 3 || !availableDates.includes(dateStr) || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            return;
        }
        
        handleDateSelect(dateStr);
    };

    const handleManualDateSubmit = () => {
        if (!dateInput) {
            return;
        }
        
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
            if (availableDates.includes(dateInput)) {
                handleDateSelect(dateInput);
                return;
            }
            alert('Date not found in available dates. Please select from the dropdown.');
            return;
        }
        
        const parts = dateInput.split('-');
        if (parts.length !== 3 || parts[0].length !== 4) {
            alert('Invalid date format. Please use DD-MM-YYYY or select from dropdown.');
            return;
        }
        
        const dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        if (availableDates.includes(dateStr)) {
            handleDateSelect(dateStr);
            return;
        }
        
        alert('Date not found in available dates. Please select from the dropdown.');
    };

    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <h1 className={styles.title}>History</h1>
                <p className={styles.subtitle}>{getFilterTitle()}</p>
            </section>

            <section className={styles.filterSection}>
                <div className={styles.dataTypeSelector}>
                    <label htmlFor="data-type-select" className={styles.dataTypeLabel}>
                        Data Type:
                    </label>
                    <select
                        id="data-type-select"
                        className={styles.dataTypeSelect}
                        value={dataType}
                        onChange={(e) => {
                            setDataType(e.target.value as DataType);
                            setSelectedDate('');
                            setDateInput('');
                        }}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div className={styles.dateSelector}>
                    <label htmlFor="date-select" className={styles.dateLabel}>
                        Select Date:
                    </label>
                    <div className={styles.dateInputGroup}>
                        <select
                            id="date-select"
                            className={styles.dateSelect}
                            value={selectedDate}
                            onChange={(e) => handleDateSelect(e.target.value)}
                            disabled={datesLoading}
                        >
                            <option value="">All Dates</option>
                            {availableDates.map((date) => (
                                <option key={date} value={date}>
                                    {formatDateForDisplay(date)}
                                </option>
                            ))}
                        </select>
                        <span className={styles.dateDivider}>or</span>
                        <div className={styles.dateInputWrapper}>
                            <input
                                type="text"
                                className={styles.dateInput}
                                placeholder="DD-MM-YYYY"
                                value={dateInput}
                                onChange={handleDateInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleManualDateSubmit();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {selectedDate && (
                        <button
                            className={styles.clearDateButton}
                            onClick={() => {
                                setSelectedDate('');
                                setDateInput('');
                            }}
                        >
                            Clear Selection
                        </button>
                    )}
                </div>

                {selectedDate && (
                    <p className={styles.periodLabel}>
                        <span className={styles.selectedDateLabel}>
                            Showing data for: <strong>{formatDateForDisplay(selectedDate)}</strong>
                        </span>
                    </p>
                )}
            </section>

            {loading && (
                <div className={styles.loading}>
                    <p>Loading history data...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>Error loading data: {error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {averageGauges.length > 0 ? (
                        <>
                            <section className={styles.section}>
                                <Gauges 
                                    data={averageGauges} 
                                    title="Average Gauges Data"
                                />
                            </section>

                            <section className={styles.section}>
                                <Gauges 
                                    data={detectionGauges} 
                                    title="Average Detection"
                                />
                            </section>
                        </>
                    ) : (
                        <div className={styles.noData}>
                            <p>No data available for the selected filter period.</p>
                        </div>
                    )}

                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Detection Summary</h3>
                            <div className={styles.statContent}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Total Detections:</span>
                                    <span className={styles.statValue}>{averageDetection.totalDetections}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Avg Confidence:</span>
                                    <span className={styles.statValue}>{averageDetection.averageConfidence}%</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <h3>Health Status</h3>
                            <div className={styles.statContent}>
                                <StatusItem healthStatus={averageDetection.healthStatus} />
                            </div>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default History;