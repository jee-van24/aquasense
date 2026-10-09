import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { severity, buildingId, isResolved, search } = req.query;

    const whereClause: any = {};
    if (severity && typeof severity === 'string' && severity !== 'All') {
      whereClause.severity = severity;
    }
    if (buildingId && typeof buildingId === 'string') {
      whereClause.buildingId = buildingId;
    }
    if (isResolved !== undefined) {
      whereClause.isResolved = isResolved === 'true';
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        sensor: true,
        building: true,
        leak: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = alerts.map(a => ({
      id: a.id,
      leakId: a.leakId,
      sensorId: a.sensorId,
      sensorCode: a.sensor.code,
      sensorName: a.sensor.name,
      buildingId: a.buildingId,
      buildingName: a.building.name,
      severity: a.severity,
      title: a.title,
      message: a.message,
      leakProbability: a.leakProbability,
      estimatedWastage: a.estimatedWastage,
      recommendedAction: a.recommendedAction,
      isRead: a.isRead,
      isResolved: a.isResolved,
      createdAt: a.createdAt,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('getAlerts error:', error);
    return res.status(500).json({ error: 'Failed to retrieve alerts' });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead, isResolved } = req.body;

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(isResolved !== undefined && { isResolved }),
      },
      include: {
        sensor: true,
        building: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('updateAlert error:', error);
    return res.status(500).json({ error: 'Failed to update alert' });
  }
};

export const markAllAlertsRead = async (req: Request, res: Response) => {
  try {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('markAllAlertsRead error:', error);
    return res.status(500).json({ error: 'Failed to mark all alerts as read' });
  }
};
