import React, { useState, useEffect } from 'react';
import { sensorService } from '../services/sensorService';
import { buildingService } from '../services/buildingService';
import { Sensor, Building } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  X,
  Gauge,
  Building2,
  Clock,
  Droplets,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Partial<Sensor>>({});

  // Add Sensor Form state
  const [newSensorCode, setNewSensorCode] = useState('');
  const [newSensorName, setNewSensorName] = useState('');
  const [newSensorType, setNewSensorType] = useState('Ultrasonic Flow Meter');
  const [newBuildingId, setNewBuildingId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newBaseline, setNewBaseline] = useState('4.0');
  const [newDiameter, setNewDiameter] = useState('25.0');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [sData, bData] = await Promise.all([
        sensorService.getSensors(),
        buildingService.getBuildings(),
      ]);
      setSensors(sData);
      setBuildings(bData);
      if (bData.length > 0 && !newBuildingId) {
        setNewBuildingId(bData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (sensorId: string) => {
    try {
      const detailed = await sensorService.getSensorById(sensorId);
      setSelectedSensor(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const bObj = await buildingService.getBuildingById(newBuildingId);
      const targetRoomId = bObj.rooms && bObj.rooms.length > 0 ? bObj.rooms[0].id : '';

      await sensorService.createSensor({
        code: newSensorCode,
        name: newSensorName,
        type: newSensorType,
        buildingId: newBuildingId,
        roomId: targetRoomId,
        baselineFlowLpm: Number(newBaseline),
        pipeDiameterMm: Number(newDiameter),
      });

      setIsAddModalOpen(false);
      setNewSensorCode('');
      setNewSensorName('');
      await fetchData();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to register sensor');
    }
  };

  const handleOpenEdit = (sensor: Sensor) => {
    setEditingSensor({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      baselineFlowLpm: sensor.baselineFlowLpm,
      pipeDiameterMm: sensor.pipeDiameterMm,
      status: sensor.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSensor.id) return;
    try {
      await sensorService.updateSensor(editingSensor.id, editingSensor);
      setIsEditModalOpen(false);
      await fetchData();
      if (selectedSensor?.id === editingSensor.id) {
        const refreshed = await sensorService.getSensorById(editingSensor.id);
        setSelectedSensor(refreshed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSensors = sensors.filter((s) => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedBuilding !== 'All' && s.buildingId !== selectedBuilding) {
      return false;
    }
    return true;
  });

  if (loading && sensors.length === 0) {
    return <LoadingSpinner message="Querying sensor network topology..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Sensor Network Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provision, calibrate, and inspect simulated water flow meter endpoints across institutional campus zones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Sensor
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="All">All Campus Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensors Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Sensor ID / Name</th>
                <th className="py-3 px-4">Building & Zone</th>
                <th className="py-3 px-4">Sensor Type</th>
                <th className="py-3 px-4">Operating Status</th>
                <th className="py-3 px-4">Current Flow</th>
                <th className="py-3 px-4">Baseline</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSensors.map((sensor) => (
                <tr key={sensor.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-cyan-400">{sensor.code}</div>
                    <div className="font-medium text-slate-200 line-clamp-1">{sensor.name}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{sensor.buildingName}</div>
                    <div className="text-[11px] text-slate-500">{sensor.roomName}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    <div>{sensor.type}</div>
                    <div className="text-[11px] text-slate-500">{sensor.pipeDiameterMm} mm internal</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                        sensor.status === 'leak'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : sensor.status === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : sensor.status === 'offline'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {sensor.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white">
                    {sensor.currentFlowLpm} <span className="text-[10px] font-normal text-slate-400">L/min</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {sensor.baselineFlowLpm} L/min
                  </td>

                  <td className="py-3.5 px-4">
                    <RiskBadge level={sensor.riskLevel} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenDetail(sensor.id)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
                      title="Inspect sensor telemetry history"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(sensor)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                      title="Edit sensor calibration"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SENSOR INSPECTION DRAWER / MODAL */}
      {selectedSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedSensor.code}
                  </span>
                  <RiskBadge level={selectedSensor.riskLevel} />
                </div>
                <h2 className="text-base font-bold text-white">{selectedSensor.name}</h2>
                <p className="text-xs text-slate-400">
                  {selectedSensor.buildingName} &bull; {selectedSensor.roomName} ({selectedSensor.areaType})
                </p>
              </div>

              <button
                onClick={() => setSelectedSensor(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Current Flow</span>
                <span className="text-base font-bold text-white">{selectedSensor.currentFlowLpm} L/min</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Baseline Flow</span>
                <span className="text-base font-bold text-slate-300">{selectedSensor.baselineFlowLpm} L/min</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Internal Diameter</span>
                <span className="text-base font-bold text-cyan-400">{selectedSensor.pipeDiameterMm} mm</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Anomaly Score</span>
                <span className="text-base font-bold text-amber-400">{selectedSensor.anomalyScore}%</span>
              </div>
            </div>

            {/* Historical Telemetry Chart */}
            {selectedSensor.historicalReadings && selectedSensor.historicalReadings.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Historical Flow Telemetry (24h)</h4>
                <div className="h-44 w-full bg-slate-950 rounded-xl border border-slate-800 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedSensor.historicalReadings} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="flowRate" name="Flow Rate (L/min)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="baseline" name="Target Baseline" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500 bg-slate-950 p-3 rounded-lg border border-slate-800">
              Note: This endpoint is simulated by the AquaSense IoT telemetry engine. External physical hardware can post directly to <code className="text-cyan-400">POST /api/sensors/reading</code> with JSON payload.
            </div>
          </div>
        </div>
      )}

      {/* ADD SENSOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Register Simulated IoT Sensor
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSensor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Sensor Code (e.g. S-ENG-105)</label>
                <input
                  type="text"
                  required
                  value={newSensorCode}
                  onChange={(e) => setNewSensorCode(e.target.value)}
                  placeholder="S-ENG-105"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sensor Description</label>
                <input
                  type="text"
                  required
                  value={newSensorName}
                  onChange={(e) => setNewSensorName(e.target.value)}
                  placeholder="2nd Floor Washroom Supply Sensor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sensor Type</label>
                <select
                  value={newSensorType}
                  onChange={(e) => setNewSensorType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Ultrasonic Flow Meter">Ultrasonic Flow Meter</option>
                  <option value="Pulse Water Meter">Pulse Water Meter</option>
                  <option value="In-line Flow Sensor">In-line Flow Sensor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Campus Building</label>
                <select
                  value={newBuildingId}
                  onChange={(e) => setNewBuildingId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Baseline Flow (L/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBaseline}
                    onChange={(e) => setNewBaseline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Pipe Diameter (mm)</label>
                  <input
                    type="number"
                    step="1"
                    value={newDiameter}
                    onChange={(e) => setNewDiameter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-sm"
                >
                  Register Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SENSOR MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                Edit Sensor Calibration
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Description / Name</label>
                <input
                  type="text"
                  value={editingSensor.name || ''}
                  onChange={(e) => setEditingSensor({ ...editingSensor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sensor Type</label>
                <input
                  type="text"
                  value={editingSensor.type || ''}
                  onChange={(e) => setEditingSensor({ ...editingSensor, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Baseline Flow (L/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSensor.baselineFlowLpm || 4.0}
                    onChange={(e) => setEditingSensor({ ...editingSensor, baselineFlowLpm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Status</label>
                  <select
                    value={editingSensor.status || 'online'}
                    onChange={(e) => setEditingSensor({ ...editingSensor, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="online">Online</option>
                    <option value="warning">Warning</option>
                    <option value="leak">Leak</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
