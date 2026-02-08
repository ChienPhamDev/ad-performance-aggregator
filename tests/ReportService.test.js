const ReportService = require('../src/services/ReportService');

describe('ReportService', () => {
  let reportService;
  let mockCampaigns;

  beforeEach(() => {
    reportService = new ReportService();
    mockCampaigns = [
      { id: 'c1', ctr: 0.1, total_conversions: 10, cpa: 2 },
      { id: 'c2', ctr: 0.2, total_conversions: 5, cpa: 4 },
      { id: 'c3', ctr: 0.05, total_conversions: 20, cpa: 1 },
      { id: 'c4', ctr: 0.15, total_conversions: 0, cpa: null },
      { id: 'c5', ctr: 0.3, total_conversions: 2, cpa: 10 },
      { id: 'c6', ctr: 0.25, total_conversions: 8, cpa: 3 },
      { id: 'c7', ctr: 0.08, total_conversions: 15, cpa: 1.5 },
      { id: 'c8', ctr: 0.12, total_conversions: 4, cpa: 5 },
      { id: 'c9', ctr: 0.18, total_conversions: 6, cpa: 3.5 },
      { id: 'c10', ctr: 0.22, total_conversions: 3, cpa: 8 },
      { id: 'c11', ctr: 0.02, total_conversions: 50, cpa: 0.5 },
    ];
  });

  describe('getTop10ByCtr', () => {
    it('should return top 10 campaigns by CTR descending', () => {
      const top10 = reportService.getTop10ByCtr(mockCampaigns);
      expect(top10.length).toBe(10);
      expect(top10[0].id).toBe('c5'); // CTR 0.3
      expect(top10[1].id).toBe('c6'); // CTR 0.25
      expect(top10[9].id).toBe('c3'); // CTR 0.05
    });
  });

  describe('getTop10ByLowestCpa', () => {
    it('should return top 10 campaigns by lowest CPA ascending, excluding zero conversions', () => {
      const top10 = reportService.getTop10ByLowestCpa(mockCampaigns);
      expect(top10.length).toBe(10);
      expect(top10.find((c) => c.id === 'c4')).toBeUndefined(); // c4 has 0 conversions
      expect(top10[0].id).toBe('c11'); // CPA 0.5
      expect(top10[1].id).toBe('c3'); // CPA 1
      expect(top10[2].id).toBe('c7'); // CPA 1.5
    });
  });
});
