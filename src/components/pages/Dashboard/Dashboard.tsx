import Gauges from "../../ui/Gauges";
import Graph from "../../ui/Graph";
import { useCurrent } from "../../../hooks/useCurrent";
import { useLatestPrediction } from "../../../hooks/useLatestPrediction";
import PredictionCard from "../History/section/predCard";
import { SENSOR_METRIC_CONFIG } from "../../../constants/data";

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

  const dashboardGauges = gauges.filter(
    (g) => g.name !== SENSOR_METRIC_CONFIG.upstream_rain.label
  );

  const dashboardGraph = {
    ...graph,
    dataKeys: graph.dataKeys.filter((key) => key !== "upstream_rain"),
    colors: graph.colors?.filter(
      (_, i) => graph.dataKeys[i] !== "upstream_rain"
    ),
  };

  return (
    <main>
      <div className={styles.Dashboard}>
        <div className={styles.Gauges}>
          {currentLoading && <p>Loading current metrics</p>}
          {isCurrentReady && <Gauges data={dashboardGauges} title="Current Metrics" />}
        </div>
        
        {isPredReady && (forecast || nowcast) && (
          <div className={styles.predictionsGrid}>
            {forecast && <PredictionCard title="Forecast" data={forecast} />}
            {nowcast && <PredictionCard title="Nowcast" data={nowcast} />}
          </div>
        )}

        <div className={styles.Graph}>
          {currentLoading && <p>Loading graph</p>}
          {isCurrentReady && dashboardGraph.data.length > 0 && (
            <Graph data={dashboardGraph} title="Realtime Graph" type="area" />
          )}
          {isCurrentReady && dashboardGraph.data.length === 0 && <p>No data available.</p>}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;