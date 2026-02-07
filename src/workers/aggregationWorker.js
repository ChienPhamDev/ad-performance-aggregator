const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");

/**
 * Worker thread for processing a chunk of the CSV file.
 * Performs fast manual parsing to minimize overhead.
 */
function processChunk() {
    const { filePath, start, end } = workerData;
    const campaigns = new Map();
    const buffer = Buffer.alloc(64 * 1024); // 64KB buffer for reading

    let fd;
    try {
        fd = fs.openSync(filePath, "r");
        let position = start;
        let leftover = "";

        while (position < end) {
            const bytesToRead = Math.min(buffer.length, end - position);
            const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, position);

            if (bytesRead === 0) break;

            const content = leftover + buffer.toString("utf8", 0, bytesRead);
            const lines = content.split("\n");

            // Save the last partial line for the next iteration
            leftover = lines.pop();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                processLine(line, campaigns);
            }

            position += bytesRead;
        }

        // Process remaining leftover if any (though usually end boundary handles this)
        if (leftover.trim()) {
            processLine(leftover, campaigns);
        }

        // Convert Map to Object for sending back (Map cannot be sent directly efficiently in some versions)
        // Actually, send an array of entries or just the Map if the node version supports it (12.16+ supports Map)
        parentPort.postMessage(Array.from(campaigns.entries()));
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    } finally {
        if (fd) fs.closeSync(fd);
    }
}

/**
 * Parses a single CSV line and updates the campaign aggregation.
 * Optimized with manual splitting and indexed access.
 */
function processLine(line, campaigns) {
    const parts = line.split(",");
    if (parts.length < 6 || parts[0] === "campaign_id") return;

    const id = parts[0];
    const impressions = parseInt(parts[2], 10) || 0;
    const clicks = parseInt(parts[3], 10) || 0;
    const spend = parseFloat(parts[4]) || 0;
    const conversions = parseInt(parts[5], 10) || 0;

    let stats = campaigns.get(id);
    if (!stats) {
        stats = {
            total_impressions: 0,
            total_clicks: 0,
            total_spend: 0,
            total_conversions: 0,
        };
        campaigns.set(id, stats);
    }

    stats.total_impressions += impressions;
    stats.total_clicks += clicks;
    stats.total_spend += spend;
    stats.total_conversions += conversions;
}

processChunk();
