import prisma from '../prisma/client';
import { evaluateSensorTelemetry, getDiurnalMultiplier } from './anomalyDetection';

class IoTSimulator {
  private isRunning: boolean = true;
  private intervalMs: number = 10000; // Generate pulse every 10 seconds in dev demo
  private timer: NodeJS.Timeout | null = null;
  private tickCount: number = 0;

  constructor() {
    // Simulator initialized
  }

  public start() {
    if (this.timer) return;
    this.isRunning = true;
    console.log(`📡 [IoT Simulator] Started periodic telemetry stream (${this.intervalMs / 1000}s interval).`);
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        console.error('❌ [IoT Simulator] Tick execution error:', err);
      });
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('⏸️ [IoT Simulator] Telemetry simulation paused.');
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      intervalSeconds: this.intervalMs / 1000,
      totalTicks: this.tickCount,
      mode: 'Simulated IoT (Academic EVS Prototype)',
      hardwareIntegrated: false,
    };
  }

  /**
   * Performs one cycle of simulated IoT telemetry generation for all active sensors
   */
  public async tick() {
    this.tickCount++;
    const now = new Date();
    const currentHour = now.getHours();

    // Fetch all sensors with room and building relations
    const sensors = await prisma.sensor.findMany({
      include: {
        room: true,
        building: true,
        readings: {
          take: 8,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    for (const sensor of sensors) {
      if (sensor.status === 'offline') {
        // Sensor is offline/in-maintenance, zero flow
        await prisma.sensor.update({
          where: { id: sensor.id },
          data: {
            currentFlowLpm: 0,
            riskLevel: 'Normal',
            anomalyScore: 0,
            lastReadingAt: now,
          },
        });
        continue;
      }

      // Calculate deterministic flow according to defined scenario profiles
      let targetFlow = 0;
      const diurnal = getDiurnalMultiplier(currentHour, sensor.room.areaType);
      const gentleWobble = Math.sin((this.tickCount + sensor.code.charCodeAt(sensor.code.length - 1)) * 0.4) * 0.25;

      switch (sensor.code) {
        // Scenario: Chronic severe tap leak in Chemistry Lab
        case 'S-ENG-102':
          // Consistently elevated ~18.5 L/min with minor hydraulic fluctuation
          targetFlow = 18.2 + Math.abs(gentleWobble * 1.2);
          break;

        // Scenario: Silent toilet flapper leak in Hostel Washroom 2
        case 'S-HST-302':
          // Continuous nocturnal & day seep of ~7.4 L/min
          targetFlow = 7.2 + Math.abs(gentleWobble * 0.8);
          break;

        // Scenario: Basement HVAC Chiller loop slight elevated drift
        case 'S-ADM-203':
          targetFlow = 12.5 + Math.abs(gentleWobble * 0.6);
          break;

        // Scenario: Sub-surface Master Inflow Aggregator reflects child leaks
        case 'S-HST-304':
          targetFlow = (sensor.baselineFlowLpm * diurnal) + 5.4 + gentleWobble;
          break;

        // Normal sensors: follow diurnal cycles with gentle natural noise
        default:
          targetFlow = Math.max(0.1, (sensor.baselineFlowLpm * diurnal) + gentleWobble);
          break;
      }

      targetFlow = Number(Math.max(0, targetFlow).toFixed(1));

      // Run AI/ML Anomaly Detection Evaluation
      const recentReadings = sensor.readings.map(r => ({
        flowRate: r.flowRate,
        timestamp: r.timestamp,
      }));

      const evaluation = evaluateSensorTelemetry({
        sensorCode: sensor.code,
        sensorName: sensor.name,
        buildingName: sensor.building.name,
        areaType: sensor.room.areaType,
        baselineFlowLpm: sensor.baselineFlowLpm,
        currentFlowLpm: targetFlow,
        recentReadings,
        timestamp: now,
      });

      // Update sensor record
      let statusToSet = 'online';
      if (evaluation.riskLevel === 'High Risk') statusToSet = 'leak';
      else if (evaluation.riskLevel === 'Medium Risk') statusToSet = 'warning';

      await prisma.sensor.update({
        where: { id: sensor.id },
        data: {
          currentFlowLpm: targetFlow,
          status: statusToSet,
          riskLevel: evaluation.riskLevel,
          anomalyScore: evaluation.anomalyScore,
          lastReadingAt: now,
        },
      });

      // Get latest total consumption or calculate
      const lastReading = sensor.readings[0];
      const previousTotal = lastReading ? lastReading.totalConsumption : 1500;
      // Increment cumulative liters by flow for the interval fraction (10s = 1/6 min)
      const addedLiters = (targetFlow / 6);
      const newTotal = Number((previousTotal + addedLiters).toFixed(1));

      // Create new sensor reading
      await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          flowRate: targetFlow,
          totalConsumption: newTotal,
          timestamp: now,
        },
      });

      // If High Risk or Critical leak detected, ensure an active Leak record exists
      if (evaluation.riskLevel === 'High Risk' && statusToSet === 'leak') {
        const existingActiveLeak = await prisma.leak.findFirst({
          where: {
            sensorId: sensor.id,
            status: { in: ['Detected', 'Investigating'] },
          },
        });

        if (existingActiveLeak) {
          // Update existing leak progression
          await prisma.leak.update({
            where: { id: existingActiveLeak.id },
            data: {
              currentFlowRate: targetFlow,
              estimatedLossLiters: {
                increment: addedLiters,
              },
              lossRateLph: evaluation.lossRateLph,
              anomalyScore: evaluation.anomalyScore,
              probability: evaluation.leakProbability,
              aiExplanation: evaluation.aiExplanation,
            },
          });
        } else {
          // Create new leak incident and alert
          const newLeak = await prisma.leak.create({
            data: {
              sensorId: sensor.id,
              buildingId: sensor.buildingId,
              roomId: sensor.roomId,
              severity: evaluation.severity,
              probability: evaluation.leakProbability,
              anomalyScore: evaluation.anomalyScore,
              status: 'Detected',
              estimatedLossLiters: evaluation.estimatedWastageLiters,
              lossRateLph: evaluation.lossRateLph,
              currentFlowRate: targetFlow,
              baselineFlowRate: sensor.baselineFlowLpm,
              aiExplanation: evaluation.aiExplanation,
              recommendedAction: evaluation.recommendedAction,
              startTime: now,
            },
          });

          await prisma.alert.create({
            data: {
              leakId: newLeak.id,
              sensorId: sensor.id,
              buildingId: sensor.buildingId,
              severity: evaluation.severity,
              title: `Telemetry Alert: Abnormal Water Flow on ${sensor.name}`,
              message: evaluation.aiExplanation,
              leakProbability: evaluation.leakProbability,
              estimatedWastage: evaluation.estimatedWastageLiters,
              recommendedAction: evaluation.recommendedAction,
              isRead: false,
              isResolved: false,
            },
          });
        }
      }
    }
  }
}

export const iotSimulator = new IoTSimulator();
