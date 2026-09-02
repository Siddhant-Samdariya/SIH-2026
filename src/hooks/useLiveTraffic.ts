import { useState, useEffect } from 'react';
import { Camera, ANPRRecord, Alert, DashboardMetrics } from '../types/itms';
import { getCameras, getDashboardMetrics } from '../api/traffic';
import { getANPRRecords } from '../api/anpr';
import { getAlerts } from '../api/incidents';

export function useLiveTraffic() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [anprList, setAnprList] = useState<ANPRRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(29.8);

  useEffect(() => {
    // Safe initial fetch with robust error catching
    Promise.all([
      getDashboardMetrics().catch(() => null),
      getCameras().catch(() => []),
      getANPRRecords().catch(() => []),
      getAlerts().catch(() => [])
    ]).then(([m, c, a, al]) => {
      if (m) setMetrics(m);
      if (Array.isArray(c)) setCameras(c);
      if (Array.isArray(a)) setAnprList(a);
      if (Array.isArray(al)) setAlerts(al);
    }).catch(err => {
      console.warn('Live traffic hook load fallback:', err);
    });

    // Real-time ticker simulation
    const interval = setInterval(() => {
      if (!isLive) return;

      // Small jitter in FPS & total counts
      setFps(() => Number((29.5 + Math.random() * 0.9).toFixed(1)));

      setMetrics(prev => {
        if (!prev) return prev;
        const newDetections = Math.floor(Math.random() * 3) + 1;
        const densityJitter = (Math.random() - 0.5) * 0.4;
        return {
          ...prev,
          totalVehiclesDetected: prev.totalVehiclesDetected + newDetections,
          currentTrafficDensity: Math.min(99, Math.max(20, Number((prev.currentTrafficDensity + densityJitter).toFixed(1)))),
          averageVehicleSpeed: Number((prev.averageVehicleSpeed + (Math.random() - 0.5) * 0.5).toFixed(1)),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  return {
    metrics,
    cameras,
    anprList,
    alerts,
    isLive,
    setIsLive,
    fps
  };
}
