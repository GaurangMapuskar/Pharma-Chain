from flask import Flask, jsonify, request
import polars as pl
from nixtla import NixtlaClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Initialize Nixtla client
nixtla_client = NixtlaClient(api_key="nixak-6NkDflFX3y0kJil9KVQSdrFKGZkwu54GX40XGc22GumZiaYpXgZMIGCq236SAnIEPnFK6yOD2LeDdE4Z")

# Load the dataset once on server startup
dtypes = {"AV3MT01": pl.Float64}

df = pl.read_csv(
    'data (1).csv',
    try_parse_dates=True,
    schema_overrides=dtypes  # Pass the dtypes dictionary to the read_csv function
)
df = df.rename({"PRODUCT": "unique_id", "Month": "ds", "Sale": "y"})

# Endpoint to get available unique_ids
@app.route('/unique_ids', methods=['GET'])
def get_unique_ids():
    unique_ids = df["unique_id"].unique().to_list()
    return jsonify({"unique_ids": unique_ids})

# Endpoint to get forecast for a specific unique_id
@app.route('/forecast', methods=['POST'])
def get_forecast():
    data = request.get_json()
    unique_id = data.get("unique_id")
    h = data.get("h", 12)

    # Filter data for the selected unique_id
    medicine_data = df.filter(pl.col("unique_id") == unique_id)

    # Generate forecast using Nixtla API
    forecast = nixtla_client.forecast(
        df=medicine_data,
        h=h,
        time_col="ds",
        target_col="y",
        freq="1mo",
    )

    # Convert forecast to pandas DataFrame
    forecast_df = forecast.to_pandas()

    # Prepare forecast data for response
    forecast_data = {
        "ds": forecast_df["ds"].tolist(),  # Dates for the forecast
        "TimeGPT": forecast_df["TimeGPT"].tolist(),  # Forecasted values (yhat)
        "ActualValues": medicine_data["y"].tail(h).to_list()  # Actual values (y) for the last 'h' periods
    }

    return jsonify(forecast_data)

if __name__ == '__main__':
    app.run(debug=True)
