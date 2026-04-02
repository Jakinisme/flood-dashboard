import Gauges from "../../ui/Gauges";
import Graph from "../../ui/Graph";
import { useCurrent } from "../../../hooks/useCurrent";
import { useLatestPrediction } from "../../../hooks/useLatestPrediction";
import PredictionCard from "../History/section/predCard";

import "../../../styles/global.css";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const {
    gauges,
    graph,
    loading: currentLoading,
    error: currentError,
  } = useCurrent();

  const {
    forecast,
    nowcast,
    loading: predLoading,
    error: predError,
  } = useLatestPrediction();

  const isCurrentReady = !currentLoading && !currentError;
  const isPredReady = !predLoading && !predError;

  return (
    <main>
      <div className={styles.Dashboard}>
        <div className={styles.Gauges}>
          {currentLoading && <p>Loading current metrics</p>}
          {isCurrentReady && <Gauges data={gauges} title="Current Metrics" />}
        </div>
        
        {isPredReady && (forecast || nowcast) && (
          <div className={styles.predictionsGrid}>
            {forecast && <PredictionCard title="Forecast" data={forecast} />}
            {nowcast && <PredictionCard title="Nowcast" data={nowcast} />}
          </div>
        )}

        <div className={styles.Graph}>
          {currentLoading && <p>Loading graph</p>}
          {isCurrentReady && graph.data.length > 0 && (
            <Graph data={graph} title="Realtime Graph" type="area" />
          )}
          {isCurrentReady && graph.data.length === 0 && <p>No data available.</p>}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;