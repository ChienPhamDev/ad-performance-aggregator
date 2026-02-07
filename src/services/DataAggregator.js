const fs = require("fs");
const { Worker } = require("worker_threads");
const os = require("os");
const path = require("path");
const cliProgress = require("cli-progress");
const CampaignStats = require("../models/CampaignStats");

/**
 * Service to handle data aggregation from CSV streams.
 * Includes both optimized single-threaded and parallel processing modes.
 */
class DataAggregator {
    constructor(inputPath) {
        this.inputPath = inputPath;
        this.campaigns = new Map();
    }

    /**
     * Entry point for processing. Choose between parallel and single-threaded.
     */
    async process(options = {}) {
        if (options.parallel) {
            return this.processParallel(options.workers);
        }
        return this.processSingleThreaded();
    }

    /**
     * Optimized single-threaded processing.
     * Replaces csv-parser with manual parsing for better performance.
     */
    async processSingleThreaded() {
        const stats = fs.statSync(this.inputPath);
        const fileSize = stats.size;

        const progressBar = new cliProgress.SingleBar({
            format: "⏳ Processing Data (Single-Thread) | {bar} | {percentage}% | {value}/{total} Bytes",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
        });

        progressBar.start(fileSize, 0);

        return new Promise((resolve, reject) => {
            let bytesRead = 0;
            const readStream = fs.createReadStream(this.inputPath, {
                highWaterMark: 128 * 1024,
            });

            let leftover = "";
            readStream.on("data", (chunk) => {
                bytesRead += chunk.length;
                progressBar.update(bytesRead);

                const lines = (leftover + chunk.toString()).split("\n");
                leftover = lines.pop();

                for (const line of lines) {
                    this.processLine(line);
                }
            });

            readStream.on("end", () => {
                if (leftover) this.processLine(leftover);
                progressBar.stop();
                resolve(Array.from(this.campaigns.values()));
            });

            readStream.on("error", (err) => {
                progressBar.stop();
                reject(err);
            });
        });
    }

    /**
     * Parallel processing using Worker Threads.
     * Splits file into chunks and aggregates results in the main thread.
     */
    async processParallel(workerCount = os.cpus().length) {
        const stats = fs.statSync(this.inputPath);
        const fileSize = stats.size;
        const chunkSize = Math.ceil(fileSize / workerCount);

        const progressBar = new cliProgress.SingleBar({
            format: "🚀 Processing Data (Parallel - {workers} Workers) | {bar} | {percentage}%",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
        });

        progressBar.start(100, 0, { workers: workerCount });

        const boundaries = this.findChunkBoundaries(fileSize, workerCount);
        const workers = [];
        let completedWorkers = 0;

        const startTime = Date.now();

        const workerResults = await Promise.all(
            boundaries.map((boundary, i) => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker(
                        path.join(__dirname, "../workers/aggregationWorker.js"),
                        {
                            workerData: {
                                filePath: this.inputPath,
                                start: boundary.start,
                                end: boundary.end,
                            },
                        },
                    );

                    worker.on("message", (data) => {
                        if (data.error) reject(new Error(data.error));
                        else {
                            completedWorkers++;
                            progressBar.update(
                                (completedWorkers / workerCount) * 100,
                            );
                            resolve(data);
                        }
                    });

                    worker.on("error", reject);
                    worker.on("exit", (code) => {
                        if (code !== 0)
                            reject(
                                new Error(
                                    `Worker stopped with exit code ${code}`,
                                ),
                            );
                    });
                });
            }),
        );

        progressBar.update(100);
        progressBar.stop();

        // Merge results from all workers
        console.log("🧩 Merging results...");
        for (const entries of workerResults) {
            for (const [id, stats] of entries) {
                let mainStats = this.campaigns.get(id);
                if (!mainStats) {
                    mainStats = new CampaignStats(id);
                    this.campaigns.set(id, mainStats);
                }
                mainStats.total_impressions += stats.total_impressions;
                mainStats.total_clicks += stats.total_clicks;
                mainStats.total_spend += stats.total_spend;
                mainStats.total_conversions += stats.total_conversions;
            }
        }

        return Array.from(this.campaigns.values());
    }

    /**
     * Finds line-aligned boundaries for file chunks.
     */
    findChunkBoundaries(fileSize, workerCount) {
        const boundaries = [];
        const fd = fs.openSync(this.inputPath, "r");
        const idealChunkSize = Math.floor(fileSize / workerCount);

        let currentPos = 0;
        for (let i = 0; i < workerCount; i++) {
            const start = currentPos;
            let end =
                i === workerCount - 1 ? fileSize : currentPos + idealChunkSize;

            if (i < workerCount - 1) {
                // Find next newline to align boundary
                const buffer = Buffer.alloc(1024);
                let foundNewline = false;
                while (!foundNewline && end < fileSize) {
                    const bytesRead = fs.readSync(fd, buffer, 0, 1024, end);
                    if (bytesRead === 0) break;

                    const chunk = buffer.toString("utf8", 0, bytesRead);
                    const newlineIdx = chunk.indexOf("\n");
                    if (newlineIdx !== -1) {
                        end += newlineIdx + 1;
                        foundNewline = true;
                    } else {
                        end += bytesRead;
                    }
                }
            }

            boundaries.push({ start, end });
            currentPos = end;
        }

        fs.closeSync(fd);
        return boundaries;
    }

    /**
     * Helper to process a single line and update state (for single-thread).
     */
    processLine(line) {
        const parts = line.split(",");
        if (parts.length < 6 || parts[0] === "campaign_id") return;

        const id = parts[0];
        let stats = this.campaigns.get(id);

        if (!stats) {
            stats = new CampaignStats(id);
            this.campaigns.set(id, stats);
        }

        stats.update({
            impressions: parseInt(parts[2], 10) || 0,
            clicks: parseInt(parts[3], 10) || 0,
            spend: parseFloat(parts[4]) || 0,
            conversions: parseInt(parts[5], 10) || 0,
        });
    }
}

module.exports = DataAggregator;
