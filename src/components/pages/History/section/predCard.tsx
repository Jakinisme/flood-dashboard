import type { PredictionForecast } from '../../../../hooks/usePredictionHistory';
import styles from '../History.module.css';

import { getRiskColor } from './riskColor';

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
        </div>
    </div>
);

export default PredictionCard;