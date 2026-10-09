export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: string;
  floors: number;
  latitude: number;
  longitude: number;
  dailyBaselineLiters: number;
  sensorCount: number;
  currentFlowLpm: number;
  dailyAverageLiters: number;
  activeLeaksCount: number;
  riskLevel: string;
  waterSavedLiters: number;
  consumptionHistory?: { date: string; actual: number; expected: number; saved: number }[];
  rooms?: Room[];
  sensors?: Sensor[];
  leaks?: Leak[];
  alerts?: Alert[];
}

export interface Room {
  id: string;
  name: string;
  code: string;
  buildingId: string;
  floor: number;
  areaType: string;
  sensors?: Sensor[];
}

export interface Sensor {
  id: string;
  code: string;
  name: string;
  type: string;
  buildingId: string;
  buildingName?: string;
  buildingCode?: string;
  roomId: string;
  roomName?: string;
  roomCode?: string;
  areaType?: string;
  pipeDiameterMm: number;
  baselineFlowLpm: number;
  currentFlowLpm: number;
  status: 'online' | 'warning' | 'leak' | 'offline';
  riskLevel: 'Normal' | 'Low Risk' | 'Medium Risk' | 'High Risk';
  anomalyScore: number;
  latitude: number;
  longitude: number;
  lastReadingAt: string;
  historicalReadings?: {
    timestamp: string;
    time: string;
    flowRate: number;
    baseline: number;
    totalConsumption: number;
  }[];
}

export interface Leak {
  id: string;
  sensorId: string;
  sensorCode: string;
  sensorName: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomName: string;
  areaType?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  probability: number;
  anomalyScore: number;
  status: 'Detected' | 'Investigating' | 'Resolved';
  estimatedLossLiters: number;
  lossRateLph: number;
  currentFlowRate: number;
  baselineFlowRate: number;
  aiExplanation: string;
  recommendedAction: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  flowHistory?: {
    time: string;
    flowRate: number;
    baseline: number;
    excess: number;
  }[];
}

export interface Alert {
  id: string;
  leakId?: string;
  sensorId: string;
  sensorCode: string;
  sensorName: string;
  buildingId: string;
  buildingName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  message: string;
  leakProbability: number;
  estimatedWastage: number;
  recommendedAction: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  type: 'LEAK_DETECTION' | 'ANOMALY_WARNING' | 'CONSERVATION_OPPORTUNITY' | 'EFFICIENCY_IMPACT';
  title: string;
  description: string;
  confidence: number;
  metricValue?: number;
  buildingName?: string;
  sensorCode?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  todayConsumptionLiters: number;
  waterSavedTodayLiters: number;
  activeAlertsCount: number;
  activeLeaksCount: number;
  overallLeakRiskScore: number;
  sensorsOnline: number;
  totalSensors: number;
  buildingsMonitored: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    consumptionHistory: { date: string; actual: number; expected: number; saved: number }[];
    usageByBuilding: {
      id: string;
      name: string;
      code: string;
      dailyBaseline: number;
      currentFlowLpm: number;
      sensorCount: number;
      activeLeaks: number;
      status: string;
    }[];
  };
  activeLeaks: Leak[];
  activeAlerts: Alert[];
  aiInsights: AIInsight[];
  environmentalImpact: {
    totalWaterSavedLiters: number;
    leaksPreventedCount: number;
    pumpingEnergySavedKwh: number;
    avoidedCarbonKg: number;
    conservationEfficiencyPercent: number;
    description: string;
  };
}

export interface WaterUsageAnalytics {
  period: string;
  metrics: {
    totalConsumption: number;
    averageDailyConsumption: number;
    peakUsage: number;
    expectedConsumption: number;
    excessConsumption: number;
    waterSaved: number;
    efficiencyScore: number;
  };
  dailyTrends: {
    date: string;
    actual: number;
    expected: number;
    saved: number;
    excess: number;
  }[];
  buildingBreakdown: {
    name: string;
    code: string;
    consumption: number;
    expected: number;
    variancePercent: number;
  }[];
  hourlyProfile: {
    hour: string;
    expected: number;
    actual: number;
    excess: number;
  }[];
}

export interface ReportsSummary {
  summary: {
    totalWaterConsumptionLiters: number;
    totalEstimatedWastageLiters: number;
    totalWaterSavedLiters: number;
    totalLeaksDetected: number;
    resolvedLeaksCount: number;
    activeLeaksCount: number;
    campusEfficiencyIndex: number;
    avoidedPumpingKwh: number;
    avoidedCarbonKg: number;
  };
  buildingRankings: {
    id: string;
    name: string;
    code: string;
    efficiencyScore: number;
    totalConsumptionLiters: number;
    totalWastageLiters: number;
    totalSavedLiters: number;
    activeLeaks: number;
    resolvedLeaks: number;
  }[];
  auditPeriod: string;
  keyFindings: string[];
}
