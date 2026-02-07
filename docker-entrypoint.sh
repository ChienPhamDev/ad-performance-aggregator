#!/bin/sh
set -e

# Path to the default CSV and its ZIP
DATA_FILE="ad_data.csv"
ZIP_FILE="ad_data.csv.zip"

# Only unzip if the ZIP exists AND the CSV does NOT exist
if [ -f "$ZIP_FILE" ] && [ ! -f "$DATA_FILE" ]; then
    echo "📦 ad_data.csv not found. Extracting from $ZIP_FILE..."
    unzip -q "$ZIP_FILE"
    echo "✅ Extraction complete."
elif [ -f "$DATA_FILE" ]; then
    echo "⏩ ad_data.csv already exists. Skipping extraction."
fi

# Execute the main command (node aggregator.js ...)
exec "$@"
