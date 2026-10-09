import React, { useState, useEffect } from 'react';
import { sensorService } from '../services/sensorService';
import { buildingService } from '../services/buildingService';
import { Sensor, Building } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SensorMap } from '../components/map/SensorMap';
import {
  Radio,
  Search,
  Filter,
  RefreshCw,
  Gauge,
  Droplets,
  Building2,
  Clock,
  MapPin,
  Activity,
  Layers,
  Map as MapIcon,
  List,
} from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [sData, bData] = await Promise.all([
        sensorService.getSensors(),
        buildingService.getBuildings(),
      ]);
      setSensors(sData);
      setBuildings(bData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // 8-second polling
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredSensors = sensors.filter((s) => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedBuilding !== 'All' && s.buildingId !== selectedBuilding) {
      return false;
    }
    if (selectedStatus !== 'All' && s.status !== selectedStatus) {
      return false;
    }
    if (selectedRisk !== 'All' && s.riskLevel !== selectedRisk) {
      return false;
    }
    return true;
  });

  if (loading && sensors.length === 0) {
    return <LoadingSpinner message="Connecting to IoT telemetry bus..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Live IoT Telemetry Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time simulated flow rates, hydraulic pressures, and algorithmic risk telemetry across campus zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Grid / Map) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition ${
                viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Sensor Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition ${
                viewMode === 'map' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              GIS Map
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-100 transition"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Building Filter */}
        <div>
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

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="All">All Operating States</option>
            <option value="online">Online (Active)</option>
            <option value="leak">Leak Detected</option>
            <option value="warning">Warning / Elevated</option>
            <option value="offline">Offline / Standby</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
          >
            <option value="All">All Anomaly Risk Levels</option>
            <option value="Normal">Normal (0-30%)</option>
            <option value="Low Risk">Low Risk (31-60%)</option>
            <option value="Medium Risk">Medium Risk (61-80%)</option>
            <option value="High Risk">High Risk (81-100%)</option>
          </select>
        </div>
      </div>

      {/* Main View: Grid or Map */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <SensorMap
            sensors={filteredSensors}
            selectedSensorId={selectedSensor?.id}
            onSelectSensor={(sensor) => setSelectedSensor(sensor)}
          />

          {selectedSensor && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedSensor.code}
                  </span>
                  <RiskBadge level={selectedSensor.riskLevel} />
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{selectedSensor.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedSensor.buildingName} &bull; {selectedSensor.roomName} ({selectedSensor.areaType})
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Current Flow:</span>
                  <span className="text-sm font-bold text-white">{selectedSensor.currentFlowLpm} L/min</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Baseline:</span>
                  <span className="text-sm font-bold text-slate-300">{selectedSensor.baselineFlowLpm} L/min</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Anomaly:</span>
                  <span className="text-sm font-bold text-amber-400">{selectedSensor.anomalyScore}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map((sensor) => {
            const isLeak = sensor.status === 'leak';
            const isWarning = sensor.status === 'warning';
            const isOffline = sensor.status === 'offline';

            let statusBorder = 'border-slate-800';
            if (isLeak) statusBorder = 'border-rose-500/40 bg-rose-950/10';
            else if (isWarning) statusBorder = 'border-amber-500/40 bg-amber-950/10';

            return (
              <div
                key={sensor.id}
                className={`bg-slate-900 border ${statusBorder} rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition`}
              >
                <div>
                  {/* Top line: Sensor Code & Risk Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800/80">
                        {sensor.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${
                          isLeak
                            ? 'text-rose-400'
                            : isWarning
                            ? 'text-amber-400'
                            : isOffline
                            ? 'text-slate-500'
                            : 'text-emerald-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLeak
                              ? 'bg-rose-500 animate-ping'
                              : isWarning
                              ? 'bg-amber-500'
                              : isOffline
                              ? 'bg-slate-600'
                              : 'bg-emerald-500'
                          }`}
                        />
                        {sensor.status}
                      </span>
                    </div>

                    <RiskBadge level={sensor.riskLevel} size="sm" />
                  </div>

                  <h3 className="font-semibold text-slate-100 text-sm line-clamp-1 mb-1">
                    {sensor.name}
                  </h3>

                  <div className="text-xs text-slate-400 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="line-clamp-1">
                        {sensor.buildingName} &bull; {sensor.roomName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{sensor.type} ({sensor.pipeDiameterMm}mm)</span>
                    </div>
                  </div>

                  {/* Flow Rate Telemetry Box */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Instantaneous Flow:</span>
                      <span className={`text-base font-bold ${isLeak ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {sensor.currentFlowLpm}{' '}
                        <span className="text-xs font-normal text-slate-400">L/min</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Expected Baseline:</span>
                      <span className="text-sm font-medium text-slate-300">
                        {sensor.baselineFlowLpm}{' '}
                        <span className="text-xs font-normal text-slate-500">L/min</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Anomaly Score:</span>
                      <span className="text-xs font-semibold text-amber-400">
                        {sensor.anomalyScore}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Zone Category:</span>
                      <span className="text-xs text-slate-300 truncate">
                        {sensor.areaType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Telemetry synced</span>
                  </div>
                  <span className="text-cyan-400 font-mono text-[10px]">Simulated Stream</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredSensors.length === 0 && (
        <div className="p-12 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
          No sensors matching selected filter criteria.
        </div>
      )}
    </div>
  );
};
