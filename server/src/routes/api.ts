import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { getDashboardData } from '../controllers/dashboardController';
import { getWaterUsageAnalytics } from '../controllers/waterUsageController';
import {
  getSensors,
  getSensorById,
  createSensor,
  updateSensor,
  getLiveTelemetry,
} from '../controllers/sensorController';
import {
  getLeaks,
  getLeakById,
  updateLeakStatus,
} from '../controllers/leakController';
import {
  getBuildings,
  getBuildingById,
} from '../controllers/buildingController';
import {
  getAlerts,
  updateAlert,
  markAllAlertsRead,
} from '../controllers/alertController';
import {
  getReportsSummary,
  exportCsvReport,
} from '../controllers/reportController';
import { getAIInsights } from '../controllers/aiController';
import { iotSimulator } from '../services/iotSimulator';

const router = Router();

// Auth Endpoints
router.post('/auth/login', login);
router.get('/auth/me', getMe);

// Dashboard
router.get('/dashboard', getDashboardData);

// Water Usage Analytics
router.get('/water-usage', getWaterUsageAnalytics);

// Sensors
router.get('/sensors/live', getLiveTelemetry);
router.get('/sensors', getSensors);
router.get('/sensors/:id', getSensorById);
router.post('/sensors', createSensor);
router.patch('/sensors/:id', updateSensor);

// Leaks
router.get('/leaks', getLeaks);
router.get('/leaks/:id', getLeakById);
router.patch('/leaks/:id', updateLeakStatus);

// Buildings
router.get('/buildings', getBuildings);
router.get('/buildings/:id', getBuildingById);

// Alerts
router.get('/alerts', getAlerts);
router.post('/alerts/mark-all-read', markAllAlertsRead);
router.patch('/alerts/:id', updateAlert);

// Reports
router.get('/reports/summary', getReportsSummary);
router.get('/reports/export-csv', exportCsvReport);

// AI Insights
router.get('/ai/insights', getAIInsights);

// Simulated IoT Engine Controls
router.get('/simulator/status', (req, res) => {
  res.json(iotSimulator.getStatus());
});

router.post('/simulator/tick', async (req, res) => {
  try {
    await iotSimulator.tick();
    res.json({ message: 'Telemetry cycle executed successfully', status: iotSimulator.getStatus() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute simulation cycle' });
  }
});

router.post('/simulator/toggle', (req, res) => {
  const isRunning = iotSimulator.toggle();
  res.json({ isRunning, message: isRunning ? 'Simulator resumed' : 'Simulator paused' });
});

export default router;
