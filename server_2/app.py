from flask import Flask, jsonify, request
import polars as pl
from nixtla import NixtlaClient
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from web3 import Web3
from datetime import datetime, timedelta
import pandas as pd
import os
import json
# import from "../blockchain/src/build/SupplyChain.json"
def load_contract_abi():
    try:
        with open('../blockchain/src/build/SupplyChain.json', 'r') as f:
            return json.load(f)['abi']
    except FileNotFoundError:
        raise ValueError("Supply chain contract ABI file not found")


app = Flask(__name__)
CORS(app)

# Blockchain Configuration
WEB3_PROVIDER = os.getenv('WEB3_PROVIDER', 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID')
CUSTOMER_CONTRACT_ADDRESS = '0x129e5EAd8E56aBee0900fbb4eDb4ab482DEAfF54'  # Your contract address
CUSTOMER_ABI = load_contract_abi()  # Your contract ABI

# Initialize Web3 and contracts
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
customer_contract = w3.eth.contract(address=CUSTOMER_CONTRACT_ADDRESS, abi=CUSTOMER_ABI)

# Initialize Nixtla client
nixtla_client = NixtlaClient(api_key="nixak-6NkDflFX3y0kJil9KVQSdrFKGZkwu54GX40XGc22GumZiaYpXgZMIGCq236SAnIEPnFK6yOD2LeDdE4Z")

# Load dataset and initialize scheduler
def load_data():
    global df
    try:
        df = pl.read_csv(
            'data (1).csv',
            try_parse_dates=True,
            schema_overrides={"AV3MT01": pl.Float64}
        ).rename({"PRODUCT": "unique_id", "Month": "ds", "Sale": "y"})
    except FileNotFoundError:
        df = pl.DataFrame(schema={
            "unique_id": pl.Utf8,
            "ds": pl.Date,
            "y": pl.Int64,
            "AV3MT01": pl.Float64
        })

load_data()

# Scheduler for monthly updates
scheduler = BackgroundScheduler()
scheduler.start()

def get_previous_month_sales():
    try:
        # Calculate date range
        today = datetime.utcnow()
        first_day = today.replace(day=1)
        last_month_end = first_day - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        
        # Get blockchain events
        events = customer_contract.events.MedicinePurchased.get_logs(
            fromBlock=0,
            argument_filters={
                'timestamp': {
                    '$gte': int(last_month_start.timestamp()),
                    '$lte': int(last_month_end.timestamp())
                }
            }
        )

        # Process events
        new_data = []
        for event in events:
            new_data.append({
                "PRODUCT": event.args.medicineAddress.hex(),
                "Month": datetime.fromtimestamp(event.args.timestamp).strftime('%Y-%m-01'),
                "Sale": event.args.quantity,
                "AV3MT01": 0.0
            })

        # Update CSV
        if new_data:
            new_df = pd.DataFrame(new_data)
            if os.path.exists('data (1).csv'):
                existing_df = pd.read_csv('data (1).csv')
                combined_df = pd.concat([existing_df, new_df])
            else:
                combined_df = new_df

            combined_df.to_csv('data (1).csv', index=False)
            load_data()  # Reload updated data

    except Exception as e:
        app.logger.error(f"Monthly update failed: {str(e)}")

# Schedule monthly job (runs on 1st day of month at 00:05 UTC)
scheduler.add_job(
    get_previous_month_sales,
    'cron',
    day=1,
    hour=0,
    minute=5
)

# Existing endpoints
@app.route('/unique_ids', methods=['GET'])
def get_unique_ids():
    unique_ids = df["unique_id"].unique().to_list()
    return jsonify({"unique_ids": unique_ids})

@app.route('/forecast', methods=['POST'])
def get_forecast():
    data = request.get_json()
    unique_id = data.get("unique_id")
    h = data.get("h", 12)

    medicine_data = df.filter(pl.col("unique_id") == unique_id)
    forecast = nixtla_client.forecast(
        df=medicine_data,
        h=h,
        time_col="ds",
        target_col="y",
        freq="1mo",
    )

    forecast_df = forecast.to_pandas()
    forecast_data = {
        "ds": forecast_df["ds"].tolist(),
        "TimeGPT": forecast_df["TimeGPT"].tolist(),
        "ActualValues": medicine_data["y"].tail(h).to_list()
    }

    return jsonify(forecast_data)

if __name__ == '__main__':
    # Run initial update if it's the first day of the month
    if datetime.utcnow().day == 1:
        get_previous_month_sales()
    app.run(debug=True)