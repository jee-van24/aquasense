import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Sensor } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { Droplets, Activity, Gauge, MapPin } from 'lucide-react';

interface Props {
  sensors: Sensor[];
  selectedSensorId?: string;
  onSelectSensor?: (sensor: Sensor) => void;
  center?: [number, number];
  zoom?: number;
}

// Helper to create color-coded divIcons based on risk level
const createCustomMarkerIcon = (riskLevel: string, isSelected: boolean) => {
  let color = '#10b981'; // Green
  let pulse = false;

  const rl = (riskLevel || '').toLowerCase();
  if (rl.includes('high') || rl.includes('critical')) {
    color = '#ef4444'; // Red
    pulse = true;
  } else if (rl.includes('medium')) {
    color = '#f59e0b'; // Amber
    pulse = true;
  } else if (rl.includes('low')) {
    color = '#0284c7'; // Blue
  }

  const border = isSelected ? 'border: 3px solid #ffffff; transform: scale(1.2);' : 'border: 2px solid rgba(255,255,255,0.8);';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
      ${pulse ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: ${color}; ${border} box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
        <div style="width: 7px; height: 7px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const SensorMap: React.FC<Props> = ({
  sensors,
  selectedSensorId,
  onSelectSensor,
  center = [12.9718, 77.5950],
  zoom = 17,
}) => {
  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sensors.map((sensor) => {
          const isSelected = sensor.id === selectedSensorId;
          const icon = createCustomMarkerIcon(sensor.riskLevel, isSelected);

          return (
            <Marker
              key={sensor.id}
              position={[sensor.latitude, sensor.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSensor && onSelectSensor(sensor),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-800">
                      {sensor.code}
                    </span>
                    <RiskBadge level={sensor.riskLevel} size="sm" />
                  </div>

                  <h4 className="font-semibold text-slate-100 text-sm mb-1 leading-tight">
                    {sensor.name}
                  </h4>

                  <div className="text-xs text-slate-400 space-y-1 my-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{sensor.buildingName || 'Campus Building'} &bull; {sensor.roomName || 'Zone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Type: {sensor.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span className="text-slate-200 font-medium">
                        Flow: {sensor.currentFlowLpm} L/min (Base: {sensor.baselineFlowLpm} L/min)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Anomaly Score: {sensor.anomalyScore}%</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Simulated IoT Location</span>
                    <span className="capitalize text-slate-300 font-medium">{sensor.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Overlay Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 shadow-xl pointer-events-auto">
        <div className="font-medium text-slate-200 mb-1.5 text-[11px] uppercase tracking-wider">
          Simulated IoT Status
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Medium / Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>High Risk / Leak</span>
          </div>
        </div>
      </div>
    </div>
  );
};
