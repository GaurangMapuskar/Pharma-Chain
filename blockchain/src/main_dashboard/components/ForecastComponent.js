import React, { useState, useEffect } from "react";
import axios from "axios";
import ChartistGraph from "react-chartist";
import "chartist/dist/chartist.min.css";

function ForecastComponent() {
  const [uniqueIds, setUniqueIds] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [forecast, setForecast] = useState([]);
  const [actualValues, setActualValues] = useState([]);
  const [ds, setDs] = useState([]); // State for the ds (dates)

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/unique_ids")
      .then((response) => {
        console.log("API Response:", response.data);
        setUniqueIds(response.data.unique_ids);
      })
      .catch((error) => console.error("Error fetching unique IDs:", error));
  }, []);

  const fetchForecast = () => {
    if (!selectedId) return;

    axios
      .post("http://127.0.0.1:5000/forecast", { unique_id: selectedId, h: 12 })
      .then((response) => {
        console.log("Forecast Response:", response.data); // Log the response to see its structure

        if (response.data && response.data.ds && response.data.TimeGPT && response.data.ActualValues) {
          setDs(response.data.ds); // Set ds (dates)
          setForecast(response.data.TimeGPT); // Set forecasted values
          setActualValues(response.data.ActualValues); // Set actual values
        } else {
          console.error("Forecast data is not in the expected format.");
        }
      })
      .catch((error) => console.error("Error fetching forecast:", error));
  };

  const chartData = {
    labels: ds, // X-axis labels
    series: [
      actualValues, // Actual values series
      forecast, // Forecasted values series
    ],
  };

  const chartOptions = {
    axisX: {
      title: "Date",
      showGrid: true,
    },
    axisY: {
      title: "Value",
      onlyInteger: false,
    },
    showLine: true,
    showPoint: true,
    fullWidth: true,
    chartPadding: {
      right: 40,
    }
  };

  return (
    <div style={{ margin: "20px auto", maxWidth: "600px" }}>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="uniqueId" style={{ fontWeight: "bold" }}>
          Select Product:
        </label>
        <select
          id="uniqueId"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            marginLeft: "10px",
            padding: "5px",
            fontSize: "14px",
          }}
        >
          <option value="">-- Select --</option>
          {uniqueIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <button
          onClick={fetchForecast}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#007BFF",
            color: "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Fetch Forecast
        </button>
      </div>

      {forecast.length > 0 && (
        <div>
          <h3 className="text-center text-lg font-semibold">Forecast</h3>
          <ChartistGraph
            className="ct-chart"
            data={chartData}
            type="Line"
            options={chartOptions}
          />
        </div>
      )}
    </div>
  );
}

export default ForecastComponent;
