import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getSensors = async (req: Request, res: Response) => {
  try {
    const { buildingId, status, riskLevel, search } = req.query;

    const whereClause: any = {};
    if (buildingId && typeof buildingId === 'string') {
      whereClause.buildingId = buildingId;
    }
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }
    if (riskLevel && typeof riskLevel === 'string') {
      whereClause.riskLevel = riskLevel;
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const sensors = await prisma.sensor.findMany({
      where: whereClause,
      include: {
        building: true,
        room: true,
      },
      orderBy: { code: 'asc' },
    });

    const formatted = sensors.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      type: s.type,
      buildingId: s.buildingId,
      buildingName: s.building.name,
      buildingCode: s.building.code,
      roomId: s.roomId,
      roomName: s.room.name,
      roomCode: s.room.code,
      areaType: s.room.areaType,
      pipeDiameterMm: s.pipeDiameterMm,
      baselineFlowLpm: s.baselineFlowLpm,
      currentFlowLpm: s.currentFlowLpm,
      status: s.status,
      riskLevel: s.riskLevel,
      anomalyScore: s.anomalyScore,
      latitude: s.latitude,
      longitude: s.longitude,
      lastReadingAt: s.lastReadingAt,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('getSensors error:', error);
    return res.status(500).json({ error: 'Failed to retrieve sensors list' });
  }
};

export const getSensorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sensor = await prisma.sensor.findUnique({
      where: { id },
      include: {
        building: true,
        room: true,
        leaks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 30,
        },
      },
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Reverse readings for chronological display
    const historicalReadings = [...sensor.readings].reverse().map(r => ({
      timestamp: r.timestamp,
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flowRate: r.flowRate,
      baseline: sensor.baselineFlowLpm,
      totalConsumption: r.totalConsumption,
    }));

    return res.json({
      ...sensor,
      historicalReadings,
    });
  } catch (error) {
    console.error('getSensorById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve sensor details' });
  }
};

export const createSensor = async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      type,
      buildingId,
      roomId,
      pipeDiameterMm,
      baselineFlowLpm,
      latitude,
      longitude,
    } = req.body;

    if (!code || !name || !type || !buildingId || !roomId) {
      return res.status(400).json({ error: 'Missing required sensor registration fields' });
    }

    const existing = await prisma.sensor.findUnique({ where: { code } });
    if (existing) {
      return res.status(409).json({ error: `Sensor with code '${code}' already exists` });
    }

    // Fetch building coordinates if not provided
    const building = await prisma.building.findUnique({ where: { id: buildingId } });
    const lat = latitude || (building?.latitude || 12.9716) + (Math.random() - 0.5) * 0.002;
    const lng = longitude || (building?.longitude || 77.5946) + (Math.random() - 0.5) * 0.002;

    const sensor = await prisma.sensor.create({
      data: {
        code,
        name,
        type,
        buildingId,
        roomId,
        pipeDiameterMm: Number(pipeDiameterMm) || 25.0,
        baselineFlowLpm: Number(baselineFlowLpm) || 4.0,
        currentFlowLpm: Number(baselineFlowLpm) || 4.0,
        latitude: Number(lat),
        longitude: Number(lng),
        status: 'online',
        riskLevel: 'Normal',
        anomalyScore: 0.0,
      },
      include: {
        building: true,
        room: true,
      },
    });

    return res.status(201).json(sensor);
  } catch (error) {
    console.error('createSensor error:', error);
    return res.status(500).json({ error: 'Failed to create sensor record' });
  }
};

export const updateSensor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, pipeDiameterMm, baselineFlowLpm, status } = req.body;

    const updated = await prisma.sensor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(pipeDiameterMm && { pipeDiameterMm: Number(pipeDiameterMm) }),
        ...(baselineFlowLpm && { baselineFlowLpm: Number(baselineFlowLpm) }),
        ...(status && { status }),
      },
      include: {
        building: true,
        room: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('updateSensor error:', error);
    return res.status(500).json({ error: 'Failed to update sensor' });
  }
};

export const getLiveTelemetry = async (req: Request, res: Response) => {
  try {
    const sensors = await prisma.sensor.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        currentFlowLpm: true,
        baselineFlowLpm: true,
        status: true,
        riskLevel: true,
        anomalyScore: true,
        lastReadingAt: true,
        building: { select: { id: true, name: true, code: true } },
        room: { select: { id: true, name: true, areaType: true } },
      },
    });

    return res.json(sensors);
  } catch (error) {
    console.error('getLiveTelemetry error:', error);
    return res.status(500).json({ error: 'Failed to fetch live sensor telemetry' });
  }
};
