const CampaignStats = require('../src/models/CampaignStats');

describe('CampaignStats', () => {
  describe('parseLine', () => {
    it('should correctly parse a valid CSV line', () => {
      const line = 'campaign_1,2024-01-01,1000,50,10.50,5';
      const result = CampaignStats.parseLine(line);
      expect(result).toEqual({
        id: 'campaign_1',
        impressions: 1000,
        clicks: 50,
        spend: 10.5,
        conversions: 5,
      });
    });

    it('should return null for header line', () => {
      const line = 'campaign_id,date,impressions,clicks,spend,conversions';
      const result = CampaignStats.parseLine(line);
      expect(result).toBeNull();
    });

    it('should return null for invalid/short lines', () => {
      const line = 'invalid,line';
      const result = CampaignStats.parseLine(line);
      expect(result).toBeNull();
    });

    it('should handle missing or malformed values by defaulting to 0', () => {
      const line = 'campaign_2,2024-01-01,abc,def,ghi,jkl';
      const result = CampaignStats.parseLine(line);
      expect(result).toEqual({
        id: 'campaign_2',
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
      });
    });
  });

  describe('update', () => {
    it('should correctly update statistics', () => {
      const stats = new CampaignStats('test_id');
      stats.update({
        impressions: 100,
        clicks: 10,
        spend: 2.5,
        conversions: 1,
      });
      expect(stats.total_impressions).toBe(100);
      expect(stats.total_clicks).toBe(10);
      expect(stats.total_spend).toBe(2.5);
      expect(stats.total_conversions).toBe(1);

      stats.update({
        impressions: 50,
        clicks: 5,
        spend: 1.5,
        conversions: 1,
      });
      expect(stats.total_impressions).toBe(150);
      expect(stats.total_clicks).toBe(15);
      expect(stats.total_spend).toBe(4.0);
      expect(stats.total_conversions).toBe(2);
    });
  });

  describe('merge', () => {
    it('should correctly merge another stats object', () => {
      const stats1 = new CampaignStats('test_id');
      stats1.total_impressions = 100;
      stats1.total_clicks = 10;
      stats1.total_spend = 5.0;
      stats1.total_conversions = 2;

      const stats2 = {
        total_impressions: 50,
        total_clicks: 5,
        total_spend: 2.5,
        total_conversions: 1,
      };

      stats1.merge(stats2);
      expect(stats1.total_impressions).toBe(150);
      expect(stats1.total_clicks).toBe(15);
      expect(stats1.total_spend).toBe(7.5);
      expect(stats1.total_conversions).toBe(3);
    });
  });

  describe('metrics (ctr, cpa)', () => {
    it('should calculate CTR correctly', () => {
      const stats = new CampaignStats('test_id');
      stats.total_impressions = 1000;
      stats.total_clicks = 50;
      expect(stats.ctr).toBe(0.05);
    });

    it('should return 0 CTR if impressions are 0', () => {
      const stats = new CampaignStats('test_id');
      expect(stats.ctr).toBe(0);
    });

    it('should calculate CPA correctly', () => {
      const stats = new CampaignStats('test_id');
      stats.total_spend = 100.0;
      stats.total_conversions = 5;
      expect(stats.cpa).toBe(20.0);
    });

    it('should return null CPA if conversions are 0', () => {
      const stats = new CampaignStats('test_id');
      stats.total_spend = 10.0;
      expect(stats.cpa).toBeNull();
    });
  });

  describe('toOutputRow', () => {
    it('should format data for output correctly', () => {
      const stats = new CampaignStats('test_id');
      stats.total_impressions = 1000;
      stats.total_clicks = 50;
      stats.total_spend = 10.5;
      stats.total_conversions = 5;

      const output = stats.toOutputRow();
      expect(output).toEqual({
        campaign_id: 'test_id',
        total_impressions: 1000,
        total_clicks: 50,
        total_spend: '10.50',
        total_conversions: 5,
        CTR: '0.0500',
        CPA: '2.10',
      });
    });

    it('should handle null CPA in output', () => {
      const stats = new CampaignStats('test_id');
      stats.total_conversions = 0;
      const output = stats.toOutputRow();
      expect(output.CPA).toBe('null');
    });
  });
});
