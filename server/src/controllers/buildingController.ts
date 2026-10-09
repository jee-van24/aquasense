import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getBuildings = async (req: Request, res: Response) => {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        sensors: true,
        leaks: {
          where: { status: { in: ['Detected', 'Investigating'] } },
        },
        waterUsage: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = buildings.map(b => {
      const currentFlow = b.sensors.reduce((sum, s) => sum + s.currentFlowLpm, 0);
      const totalSaved = b.waterUsage.reduce((sum, u) => sum + u.waterSaved, 0);
      const avgDaily = b.waterUsage.length > 0
        ? Math.round(b.waterUsage.reduce((sum, u) => sum + u.actualConsumption, 0) / b.waterUsage.length)
        : b.dailyBaselineLiters;

      let riskLevel = 'Normal';
      if (b.leaks.some(l => l.severity === 'Critical')) riskLevel = 'Critical';
      else if (b.leaks.some(l => l.severity === 'High')) riskLevel = 'High Risk';
      else if (b.leaks.some(l => l.severity === 'Medium')) riskLevel = 'Medium Risk';

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        description: b.description,
        type: b.type,
        floors: b.floors,
        latitude: b.latitude,
        longitude: b.longitude,
        dailyBaselineLiters: b.dailyBaselineLiters,
        sensorCount: b.sensors.length,
        currentFlowLpm: Number(currentFlow.toFixed(1)),
        dailyAverageLiters: avgDaily,
        activeLeaksCount: b.leaks.length,
        riskLevel,
        waterSavedLiters: totalSaved,
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('getBuildings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve buildings list' });
  }
};

export const getBuildingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            sensors: true,
          },
        },
        sensors: {
          include: {
            room: true,
          },
        },
        leaks: {
          include: {
            sensor: true,
            room: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        alerts: {
          where: { isResolved: false },
          include: {
            sensor: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        waterUsage: {
          orderBy: { date: 'asc' },
          take: 14,
        },
      },
    });

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const currentFlowLpm = building.sensors.reduce((sum, s) => sum + s.currentFlowLpm, 0);
    const activeLeaks = building.leaks.filter(l => l.status !== 'Resolved');

    // 14-day consumption history for building chart
    const consumptionHistory = building.waterUsage.map(u => ({
      date: u.date,
      actual: u.actualConsumption,
      expected: u.expectedConsumption,
      saved: u.waterSaved,
    }));

    return res.json({
      ...building,
      currentFlowLpm: Number(currentFlowLpm.toFixed(1)),
      activeLeaksCount: activeLeaks.length,
      consumptionHistory,
    });
  } catch (error) {
    console.error('getBuildingById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve building details' });
  }
};
