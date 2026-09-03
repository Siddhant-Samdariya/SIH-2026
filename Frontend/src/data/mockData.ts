import type { 
  Camera, 
  ANPRRecord, 
  Alert, 
  AiModuleStatus, 
  TrafficDataPoint, 
  DashboardMetrics,
  ReportItem 
} from '../types/itms';

export const mockCameras: Camera[] = [];

export const mockDashboardMetrics: DashboardMetrics = {
  totalVehiclesDetected: 0,
  currentTrafficDensity: 0,
  activeIncidents: 0,
  camerasOnline: 0,
  totalCameras: 0,
  averageVehicleSpeed: 0,
  congestionStatus: 'Smooth',
  waterloggingIncidents: 0,
  roadInfrastructureIssues: 0
};

export const mockANPRRecords: ANPRRecord[] = [];

export const mockAlerts: Alert[] = [];

export const mockAiModules: AiModuleStatus[] = [
  {
    id: 'MOD-01',
    name: 'Vehicle Detection',
    category: 'Detection',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 30,
    latencyMs: 0,
    recentEvent: 'No detections recorded yet',
    description: 'Real-time multi-class vehicle identification (Cars, Buses, Trucks, Motorcycles, Auto-Rickshaws).'
  },
  {
    id: 'MOD-02',
    name: 'Vehicle Tracking',
    category: 'Tracking',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 30,
    latencyMs: 0,
    recentEvent: 'No active tracking trajectories',
    description: 'Multi-object persistent tracking across frames with velocity and direction calculation.'
  },
  {
    id: 'MOD-03',
    name: 'Vehicle Counting',
    category: 'Detection',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 30,
    latencyMs: 0,
    recentEvent: 'No vehicle passes registered',
    description: 'Bi-directional directional vehicle volumetric counting per lane and junction entry.'
  },
  {
    id: 'MOD-04',
    name: 'Traffic Density Estimation',
    category: 'Detection',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No congestion data',
    description: 'Spatial occupation & headway index modeling to assess congestion status in real time.'
  },
  {
    id: 'MOD-05',
    name: 'Number Plate Detection (ANPR)',
    category: 'ANPR',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No plates localized',
    description: 'High-precision license plate bounding box localization under varied illumination.'
  },
  {
    id: 'MOD-06',
    name: 'OCR Recognition Engine',
    category: 'ANPR',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No OCR extractions',
    description: 'Indian license plate font OCR supporting standard & high-contrast reflective plates.'
  },
  {
    id: 'MOD-07',
    name: 'Traffic Sign Detection',
    category: 'Safety',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No sign detections',
    description: 'Classification of speed limits, mandatory stop, no-entry, and lane direction signs.'
  },
  {
    id: 'MOD-08',
    name: 'Pothole & Surface Defect',
    category: 'Infrastructure',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No road defects logged',
    description: 'Computer vision segmenting asphalt distress, potholes, and hazardous road cracks.'
  },
  {
    id: 'MOD-09',
    name: 'Waterlogging & Flood Monitor',
    category: 'Infrastructure',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No waterlogging detected',
    description: 'Monsoon flooding and drainage overflow detection on underpasses and low-lying roads.'
  },
  {
    id: 'MOD-10',
    name: 'Pedestrian Safety Violation',
    category: 'Safety',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No safety violations',
    description: 'Crosswalk safety monitoring, red-light pedestrian conflict prediction.'
  },
  {
    id: 'MOD-11',
    name: 'Unsafe & Rash Driving',
    category: 'Safety',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No rash driving incidents',
    description: 'Trajectory anomaly detection for rapid lane weaving, wrong-way driving, and sudden braking.'
  },
  {
    id: 'MOD-12',
    name: 'Hit-and-Run Detection',
    category: 'Safety',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No collision vectors flagged',
    description: 'Incident impact detection correlated with immediate non-stopping vehicle flight acceleration.'
  },
  {
    id: 'MOD-13',
    name: 'Road Infrastructure Damage',
    category: 'Infrastructure',
    status: 'optimal',
    detectionsToday: 0,
    avgConfidence: 0,
    fps: 0,
    latencyMs: 0,
    recentEvent: 'No infrastructure damage logged',
    description: 'Detection of damaged traffic lights, missing bollards, collapsed signposts, and broken barriers.'
  }
];

export const mockTrafficTimeSeries: TrafficDataPoint[] = [];

export const mockReports: ReportItem[] = [];
