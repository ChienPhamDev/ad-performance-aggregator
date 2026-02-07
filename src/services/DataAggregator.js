const fs = require("fs");
const csv = require("csv-parser");
const cliProgress = require("cli-progress");
const CampaignStats = require("../models/CampaignStats");
const benchmark = require("../utils/Benchmark");

/**
 * Service to handle data aggregation from CSV streams.
 */
class DataAggregator {
    constructor(inputPath) {
        this.inputPath = inputPath;
        this.campaigns = new Map();
    }

    async process() {
        const stats = fs.statSync(this.inputPath);
        const fileSize = stats.size;

        const progressBar = new cliProgress.SingleBar({
            format: "⏳ Processing Data | {bar} | {percentage}% | {value}/{total} Bytes",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
        });

        progressBar.start(fileSize, 0);

        const readStream = fs.createReadStream(this.inputPath, {
            highWaterMark: 1024 * 1024, // 1MB
        });
        const parser = readStream.pipe(csv());
        let bytesRead = 0;

        readStream.on("data", (chunk) => {
            bytesRead += chunk.length;
            progressBar.update(bytesRead);
        });

        try {
            for await (const row of parser) {
                const id = row.campaign_id;
                let stats = this.campaigns.get(id);

                if (!stats) {
                    stats = new CampaignStats(id);
                    this.campaigns.set(id, stats);
                }

                // Manual parsing is faster than auto-casting for large datasets
                stats.update({
                    impressions: parseInt(row.impressions, 10) || 0,
                    clicks: parseInt(row.clicks, 10) || 0,
                    spend: parseFloat(row.spend) || 0,
                    conversions: parseInt(row.conversions, 10) || 0,
                });
            }
            return Array.from(this.campaigns.values());
        } catch (err) {
            throw err;
        } finally {
            progressBar.stop();
        }
    }
}

module.exports = DataAggregator;
