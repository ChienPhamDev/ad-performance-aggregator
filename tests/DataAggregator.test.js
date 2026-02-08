const fs = require('fs');
const path = require('path');
const DataAggregator = require('../src/services/DataAggregator');

describe('DataAggregator', () => {
  const testCsvPath = path.join(__dirname, 'test_data.csv');

  beforeAll(() => {
    const csvContent = [
      'campaign_id,date,impressions,clicks,spend,conversions',
      'c1,2024-01-01,100,10,5.0,2',
      'c2,2024-01-01,200,20,10.0,4',
      'c1,2024-01-02,150,15,7.5,3',
      'c3,2024-01-01,50,5,2.0,1',
    ].join('\n');
    fs.writeFileSync(testCsvPath, csvContent);
  });

  afterAll(() => {
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  describe('processSingleThreaded', () => {
    it('should correctly aggregate data in single-threaded mode', async () => {
      const aggregator = new DataAggregator(testCsvPath);
      const results = await aggregator.processSingleThreaded();

      expect(results.length).toBe(3);

      const c1 = results.find((r) => r.campaign_id === 'c1');
      expect(c1.total_impressions).toBe(250);
      expect(c1.total_clicks).toBe(25);
      expect(c1.total_spend).toBe(12.5);
      expect(c1.total_conversions).toBe(5);

      const c2 = results.find((r) => r.campaign_id === 'c2');
      expect(c2.total_impressions).toBe(200);

      const c3 = results.find((r) => r.campaign_id === 'c3');
      expect(c3.total_impressions).toBe(50);
    });
  });

  // Parallel processing test might be flaky in some CI/Jest environments due to Worker Threads
  // but let's try it with a slightly larger file to ensure boundaries logic works.
  describe('processParallel', () => {
    const largeTestCsvPath = path.join(__dirname, 'large_test_data.csv');

    beforeAll(() => {
      let content = 'campaign_id,date,impressions,clicks,spend,conversions\n';
      for (let i = 0; i < 100; i++) {
        content += `c${i % 5},2024-01-01,10,1,1.0,1\n`;
      }
      fs.writeFileSync(largeTestCsvPath, content);
    });

    afterAll(() => {
      if (fs.existsSync(largeTestCsvPath)) {
        fs.unlinkSync(largeTestCsvPath);
      }
    });

    it('should correctly aggregate data in parallel mode', async () => {
      const aggregator = new DataAggregator(largeTestCsvPath);
      // Use 2 workers for test
      const results = await aggregator.processParallel(2);

      expect(results.length).toBe(5);
      results.forEach((r) => {
        expect(r.total_impressions).toBe(200); // 100 rows / 5 campaigns * 10 impressions
      });
    });
  });
});
