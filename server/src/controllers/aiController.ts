import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getAIInsights = async (req: Request, res: Response) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      include: {
        building: true,
        sensor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = insights.map(i => ({
      id: i.id,
      type: i.type,
      title: i.title,
      description: i.description,
      confidence: i.confidence,
      metricValue: i.metricValue,
      buildingName: i.building?.name,
      sensorCode: i.sensor?.code,
      createdAt: i.createdAt,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('getAIInsights error:', error);
    return res.status(500).json({ error: 'Failed to retrieve AI insights' });
  }
};
