const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const CampaignStats = require('../models/CampaignStats');

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
    fd = fs.openSync(filePath, 'r');
    let position = start;
    let leftover = '';

    while (position < end) {
      const bytesToRead = Math.min(buffer.length, end - position);
      const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, position);

      if (bytesRead === 0) break;

      const content = leftover + buffer.toString('utf8', 0, bytesRead);
      const lines = content.split('\n');

      // Save the last partial line for the next iteration
      leftover = lines.pop();

      for (let i = 0; i < lines.length; i++) {
        processLine(lines[i], campaigns);
      }

      position += bytesRead;
    }

    if (leftover) {
      processLine(leftover, campaigns);
    }

    parentPort.postMessage(Array.from(campaigns.entries()));
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  } finally {
    if (fd) fs.closeSync(fd);
  }
}

/**
 * Parses a single CSV line and updates the campaign aggregation.
 */
function processLine(line, campaigns) {
  const data = CampaignStats.parseLine(line);
  if (!data) return;

  let stats = campaigns.get(data.id);
  if (!stats) {
    stats = {
      total_impressions: 0,
      total_clicks: 0,
      total_spend: 0,
      total_conversions: 0,
    };
    campaigns.set(data.id, stats);
  }

  stats.total_impressions += data.impressions;
  stats.total_clicks += data.clicks;
  stats.total_spend += data.spend;
  stats.total_conversions += data.conversions;
}

processChunk();
