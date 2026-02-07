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
   * Updates state with new row data.
   */
  update(row) {
    this.total_impressions += row.impressions;
    this.total_clicks += row.clicks;
    this.total_spend += row.spend;
    this.total_conversions += row.conversions;
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
