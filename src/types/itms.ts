export type CameraStatus = 'online' | 'offline' | 'degraded';

export interface Camera {
  id: string;
  name: string;
  location: string;
  junction: string;
  city: string;
  lat: number;
  lng: number;
  status: CameraStatus;
  streamUrl: string;
  resolution: string;
  fps: number;
  currentDensity: number; // 0 - 100%
  avgSpeed: number; // km/h
  activeAlerts: number;
  lastPing: string;
}

export type VehicleClass = 'Car' | 'Bus' | 'Truck' | 'Motorcycle' | 'Auto-Rickshaw' | 'Emergency-Vehicle';

export interface DetectedObject {
  id: string;
  class: VehicleClass | 'Pedestrian';
  trackingId: number;
  confidence: number; // 0-100
  bbox: { x: number; y: number; w: number; h: number }; // percentages or px
  speed: number; // km/h
  plateNumber?: string;
  plateConfidence?: number;
}

export type ANPRStatus = 'verified' | 'flagged' | 'blacklisted' | 'stolen' | 'vip';

export interface ANPRRecord {
  id: string;
  plateNumber: string;
  vehicleType: VehicleClass;
  cameraId: string;
  cameraName: string;
  location: string;
  timestamp: string;
  confidence: number;
  status: ANPRStatus;
  speed: number;
  ownerName?: string;
  chassisNo?: string;
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertType = 
  | 'hit_and_run' 
  | 'heavy_congestion' 
  | 'waterlogging' 
  | 'pedestrian_violation' 
  | 'unsafe_driving' 
  | 'pothole' 
  | 'infrastructure_damage'
  | 'blacklisted_vehicle'
  | 'speed_violation';

export interface Alert {
  id: string;
  title: string;
  type: AlertType;
  severity: AlertSeverity;
  cameraId: string;
  cameraName: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  confidence: number;
  associatedVehicle?: string;
  associatedPlate?: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AiModuleStatus {
  id: string;
  name: string;
  category: 'Detection' | 'Tracking' | 'Safety' | 'Infrastructure' | 'ANPR';
  status: 'optimal' | 'degraded' | 'disabled';
  detectionsToday: number;
  avgConfidence: number;
  fps: number;
  latencyMs: number;
  recentEvent: string;
  description: string;
}

export interface TrafficDataPoint {
  time: string;
  vehiclesCount: number;
  density: number; // %
  avgSpeed: number; // km/h
  congestionLevel: number;
}

export interface DashboardMetrics {
  totalVehiclesDetected: number;
  currentTrafficDensity: number; // %
  activeIncidents: number;
  camerasOnline: number;
  totalCameras: number;
  averageVehicleSpeed: number; // km/h
  congestionStatus: 'Smooth' | 'Moderate' | 'Heavy' | 'Gridlock';
  waterloggingIncidents: number;
  roadInfrastructureIssues: number;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'Daily Traffic' | 'Incident Summary' | 'ANPR Audit' | 'Congestion Analysis' | 'AI Performance';
  generatedAt: string;
  period: string;
  size: string;
  summary: string;
  status: 'Ready' | 'Processing';
}
