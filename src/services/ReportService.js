/**
 * Service to generate specific reports from aggregated data.
 */
class ReportService {
  /**
   * Returns top 10 campaigns by CTR descending.
   */
  getTop10ByCtr(campaigns) {
    return [...campaigns].sort((a, b) => b.ctr - a.ctr).slice(0, 10);
  }

  /**
   * Returns top 10 campaigns by CPA ascending, excluding zero conversions.
   */
  getTop10ByLowestCpa(campaigns) {
    return campaigns
      .filter((c) => c.total_conversions > 0)
      .sort((a, b) => a.cpa - b.cpa)
      .slice(0, 10);
  }
}

module.exports = ReportService;
