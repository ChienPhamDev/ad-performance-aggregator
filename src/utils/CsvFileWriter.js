const fs = require('fs');
const path = require('path');

/**
 * Utility to write campaign data to CSV files.
 */
class CsvFileWriter {
  constructor(outputDir) {
    this.outputDir = outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  save(filename, data) {
    const outputPath = path.join(this.outputDir, filename);
    const header = 'campaign_id,total_impressions,total_clicks,total_spend,total_conversions,CTR,CPA\n';
    const rows = data
      .map((item) => {
        const row = item.toOutputRow();
        return `${row.campaign_id},${row.total_impressions},${row.total_clicks},${row.total_spend},${row.total_conversions},${row.CTR},${row.CPA}`;
      })
      .join('\n');

    fs.writeFileSync(outputPath, header + rows);
    console.log(`✅ Success! Results written to: ${outputPath}`);
  }
}

module.exports = CsvFileWriter;
