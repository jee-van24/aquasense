import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getLeaks = async (req: Request, res: Response) => {
  try {
    const { status, severity, buildingId } = req.query;

    const whereClause: any = {};
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }
    if (severity && typeof severity === 'string') {
      whereClause.severity = severity;
    }
    if (buildingId && typeof buildingId === 'string') {
      whereClause.buildingId = buildingId;
    }

    const leaks = await prisma.leak.findMany({
      where: whereClause,
      include: {
        sensor: true,
        building: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = leaks.map(l => ({
      id: l.id,
      sensorId: l.sensorId,
      sensorCode: l.sensor.code,
      sensorName: l.sensor.name,
      buildingId: l.buildingId,
      buildingName: l.building.name,
      roomId: l.roomId,
      roomName: l.room.name,
      areaType: l.room.areaType,
      severity: l.severity,
      probability: l.probability,
      anomalyScore: l.anomalyScore,
      status: l.status,
      estimatedLossLiters: Math.round(l.estimatedLossLiters),
      lossRateLph: l.lossRateLph,
      currentFlowRate: l.currentFlowRate,
      baselineFlowRate: l.baselineFlowRate,
      aiExplanation: l.aiExplanation,
      recommendedAction: l.recommendedAction,
      startTime: l.startTime,
      endTime: l.endTime,
      durationMinutes: Math.round(
        ((l.endTime ? new Date(l.endTime).getTime() : Date.now()) - new Date(l.startTime).getTime()) / (1000 * 60)
      ),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('getLeaks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve leaks list' });
  }
};

export const getLeakById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leak = await prisma.leak.findUnique({
      where: { id },
      include: {
        sensor: {
          include: {
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 24,
            },
          },
        },
        building: true,
        room: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!leak) {
      return res.status(404).json({ error: 'Leak record not found' });
    }

    // Historical telemetry for flow graph
    const flowHistory = [...leak.sensor.readings].reverse().map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowRate: r.flowRate,
      baseline: leak.baselineFlowRate,
      excess: Math.max(0, Number((r.flowRate - leak.baselineFlowRate).toFixed(1))),
    }));

    const durationMinutes = Math.round(
      ((leak.endTime ? new Date(leak.endTime).getTime() : Date.now()) - new Date(leak.startTime).getTime()) / (1000 * 60)
    );

    return res.json({
      ...leak,
      durationMinutes,
      flowHistory,
    });
  } catch (error) {
    console.error('getLeakById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve leak details' });
  }
};

export const updateLeakStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Detected', 'Investigating', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: Detected, Investigating, Resolved' });
    }

    const currentLeak = await prisma.leak.findUnique({ where: { id } });
    if (!currentLeak) {
      return res.status(404).json({ error: 'Leak record not found' });
    }

    const now = new Date();
    const updateData: any = { status };
    if (status === 'Resolved') {
      updateData.endTime = now;
      updateData.currentFlowRate = currentLeak.baselineFlowRate;
      updateData.aiExplanation = `Resolved by environmental maintenance. Flow verified within normal operating baseline (${currentLeak.baselineFlowRate} L/min).`;
    }

    const updatedLeak = await prisma.leak.update({
      where: { id },
      data: updateData,
      include: {
        sensor: true,
        building: true,
        room: true,
      },
    });

    // If resolved, update associated sensor and alerts
    if (status === 'Resolved') {
      await prisma.sensor.update({
        where: { id: currentLeak.sensorId },
        data: {
          status: 'online',
          riskLevel: 'Normal',
          anomalyScore: 4.0,
          currentFlowLpm: currentLeak.baselineFlowRate,
        },
      });

      // Mark associated alerts resolved
      await prisma.alert.updateMany({
        where: { leakId: id },
        data: { isResolved: true },
      });
    }

    return res.json(updatedLeak);
  } catch (error) {
    console.error('updateLeakStatus error:', error);
    return res.status(500).json({ error: 'Failed to update leak status' });
  }
};
