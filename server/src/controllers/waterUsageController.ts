import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getWaterUsageAnalytics = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '7d';
    let daysToFetch = 7;
    if (period === '30d') daysToFetch = 30;
    else if (period === '90d') daysToFetch = 90;

    const allUsage = await prisma.waterUsage.findMany({
      include: { building: true },
      orderBy: { date: 'asc' },
    });

    // Group by date
    const dateMap = new Map<string, { date: string; actual: number; expected: number; saved: number }>();
    const buildingMap = new Map<string, { name: string; code: string; totalActual: number; totalExpected: number }>();

    for (const record of allUsage) {
      // By Date
      const dateEntry = dateMap.get(record.date) || { date: record.date, actual: 0, expected: 0, saved: 0 };
      dateEntry.actual += record.actualConsumption;
      dateEntry.expected += record.expectedConsumption;
      dateEntry.saved += record.waterSaved;
      dateMap.set(record.date, dateEntry);

      // By Building
      const bKey = record.building.id;
      const bEntry = buildingMap.get(bKey) || {
        name: record.building.name,
        code: record.building.code,
        totalActual: 0,
        totalExpected: 0,
      };
      bEntry.totalActual += record.actualConsumption;
      bEntry.totalExpected += record.expectedConsumption;
      buildingMap.set(bKey, bEntry);
    }

    const dailyTrends = Array.from(dateMap.values())
      .slice(-daysToFetch)
      .map(d => ({
        ...d,
        excess: Math.max(0, d.actual - d.expected),
      }));

    const totalConsumption = dailyTrends.reduce((sum, d) => sum + d.actual, 0);
    const expectedConsumption = dailyTrends.reduce((sum, d) => sum + d.expected, 0);
    const waterSaved = dailyTrends.reduce((sum, d) => sum + d.saved, 0);
    const averageDaily = Math.round(totalConsumption / (dailyTrends.length || 1));
    const peakUsage = dailyTrends.reduce((max, d) => Math.max(max, d.actual), 0);
    const excessConsumption = Math.max(0, totalConsumption - expectedConsumption);

    const efficiencyScore = Number(
      Math.min(99, Math.max(60, 100 - (excessConsumption / (expectedConsumption || 1)) * 100)).toFixed(1)
    );

    // Hourly Campus Profile (24 hours standard profile model)
    const hourlyProfile = Array.from({ length: 24 }).map((_, hour) => {
      let multiplier = 0.15;
      if (hour >= 7 && hour <= 11) multiplier = 1.4;
      else if (hour > 11 && hour <= 17) multiplier = 1.15;
      else if (hour > 17 && hour <= 22) multiplier = 0.9;

      const baseLph = 2500;
      const expected = Math.round(baseLph * multiplier);
      // Actual has slight daytime elevations and leak impact
      const leakOffset = (hour >= 1 && hour <= 5) ? 450 : (hour >= 13 && hour <= 16 ? 900 : 80);
      const actual = Math.round(expected + leakOffset);

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        expected,
        actual,
        excess: Math.max(0, actual - expected),
      };
    });

    const buildingBreakdown = Array.from(buildingMap.values()).map(b => ({
      name: b.name,
      code: b.code,
      consumption: b.totalActual,
      expected: b.totalExpected,
      variancePercent: Number((((b.totalActual - b.totalExpected) / (b.totalExpected || 1)) * 100).toFixed(1)),
    }));

    return res.json({
      period,
      metrics: {
        totalConsumption,
        averageDailyConsumption: averageDaily,
        peakUsage,
        expectedConsumption,
        excessConsumption,
        waterSaved,
        efficiencyScore,
      },
      dailyTrends,
      buildingBreakdown,
      hourlyProfile,
    });
  } catch (error) {
    console.error('getWaterUsageAnalytics error:', error);
    return res.status(500).json({ error: 'Failed to retrieve water usage analytics' });
  }
};
