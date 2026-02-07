/**
 * Domain Object representing campaign statistics.
 * Handles metrics calculation (SRP).
 */
class CampaignStats {
  constructor(id) {
    this.campaign_id = id;
    this.total_impressions = 0;
    this.total_clicks = 0;
    this.total_spend = 0;
    this.total_conversions = 0;
  }

  /**
   * Parses a CSV line into a raw data object.
   * @param {string} line - A single CSV row.
   * @returns {object|null} Parsed data or null if invalid/header.
   */
  static parseLine(line) {
    const parts = line.split(',');
    if (parts.length < 6 || parts[0] === 'campaign_id') return null;

    return {
      id: parts[0],
      impressions: parseInt(parts[2], 10) || 0,
      clicks: parseInt(parts[3], 10) || 0,
      spend: parseFloat(parts[4]) || 0,
      conversions: parseInt(parts[5], 10) || 0,
    };
  }

  /**
   * Updates state with new row data.
   */
  update(row) {
    this.total_impressions += row.impressions;
    this.total_clicks += row.clicks;
    this.total_spend += row.spend;
    this.total_conversions += row.conversions;
  }

  /**
   * Merges another stats object into this one.
   * @param {object} stats - Stats object (can be raw or CampaignStats).
   */
  merge(stats) {
    this.total_impressions += stats.total_impressions || 0;
    this.total_clicks += stats.total_clicks || 0;
    this.total_spend += stats.total_spend || 0;
    this.total_conversions += stats.total_conversions || 0;
  }

  /**
   * Click-Through Rate: clicks / impressions
   */
  get ctr() {
    return this.total_impressions > 0 ? this.total_clicks / this.total_impressions : 0;
  }

  /**
   * Cost Per Acquisition: spend / conversions
   */
  get cpa() {
    return this.total_conversions > 0 ? this.total_spend / this.total_conversions : null;
  }

  /**
   * Formats numbers for CSV output.
   */
  toOutputRow() {
    return {
      campaign_id: this.campaign_id,
      total_impressions: this.total_impressions,
      total_clicks: this.total_clicks,
      total_spend: this.total_spend.toFixed(2),
      total_conversions: this.total_conversions,
      CTR: this.ctr.toFixed(4),
      CPA: this.cpa !== null ? this.cpa.toFixed(2) : 'null',
    };
  }
}

module.exports = CampaignStats;
