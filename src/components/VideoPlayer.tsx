import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Maximize2, 
  RefreshCw, 
  Sliders, 
  Eye, 
  CheckCircle,
  Radio,
  Layers,
  Zap,
  Target,
  Camera as CameraIcon
} from 'lucide-react';
import { Camera } from '../types/itms';

interface VideoPlayerProps {
  camera: Camera;
  camerasList?: Camera[];
  onSelectCamera?: (camera: Camera) => void;
}

interface SimulatedVehicle {
  id: number;
  class: 'Car' | 'Bus' | 'Truck' | 'Motorcycle' | 'Auto-Rickshaw';
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  width: number;
  height: number;
  confidence: number;
  plate: string;
  speedKmH: number;
  color: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  camera,
  camerasList = [],
  onSelectCamera
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showPlates, setShowPlates] = useState<boolean>(true);
  const [showSpeed, setShowSpeed] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'anpr' | 'telemetry'>('stream');
  const [selectedVehicle, setSelectedVehicle] = useState<SimulatedVehicle | null>(null);

  // Dynamic vehicles state
  const vehiclesRef = useRef<SimulatedVehicle[]>([
    { id: 42, class: 'Car', x: 120, y: 220, speedX: 1.8, speedY: 0.3, width: 110, height: 75, confidence: 94, plate: 'MP04AB1234', speedKmH: 52, color: '#06b6d4' },
    { id: 108, class: 'Bus', x: 380, y: 150, speedX: 1.2, speedY: 0.2, width: 150, height: 95, confidence: 98, plate: 'DL01CA4589', speedKmH: 38, color: '#10b981' },
    { id: 215, class: 'Truck', x: 260, y: 310, speedX: 1.0, speedY: -0.1, width: 160, height: 105, confidence: 91, plate: 'MH12DE5678', speedKmH: 34, color: '#f59e0b' },
    { id: 89, class: 'Motorcycle', x: 520, y: 280, speedX: 2.2, speedY: 0.4, width: 70, height: 50, confidence: 89, plate: 'KA05HA9911', speedKmH: 64, color: '#8b5cf6' },
    { id: 312, class: 'Auto-Rickshaw', x: 50, y: 360, speedX: 1.4, speedY: -0.2, width: 90, height: 65, confidence: 95, plate: 'UP32EA4321', speedKmH: 28, color: '#ec4899' },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw synthetic highway/road background with asphalt gradient & lane markings
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0c1322');
      bgGrad.addColorStop(0.5, '#131c2e');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective road geometry
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(150, 80);
      ctx.lineTo(650, 80);
      ctx.lineTo(780, canvas.height);
      ctx.lineTo(20, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Lane dividers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([15, 15]);
      ctx.lineWidth = 2;

      // Lane 1
      ctx.beginPath();
      ctx.moveTo(310, 80);
      ctx.lineTo(270, canvas.height);
      ctx.stroke();

      // Lane 2
      ctx.beginPath();
      ctx.moveTo(490, 80);
      ctx.lineTo(530, canvas.height);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash

      // Move & draw vehicles
      vehiclesRef.current.forEach((veh) => {
        if (isPlaying) {
          veh.x += veh.speedX;
          veh.y += veh.speedY;

          // Wrap around canvas
          if (veh.x > canvas.width + 50) {
            veh.x = -150;
            veh.y = 120 + Math.random() * 250;
          }
        }

        // Draw vehicle shadow shape
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(veh.x + veh.width / 2, veh.y + veh.height - 5, veh.width / 2 + 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw vehicle stylized body
        ctx.fillStyle = veh.color + 'bb';
        ctx.strokeStyle = veh.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(veh.x, veh.y, veh.width, veh.height, 6);
        ctx.fill();
        ctx.stroke();

        // If bounding boxes enabled
        if (showBoundingBoxes) {
          // Outer bounding box frame with corner accents
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          const padding = 6;
          const bx = veh.x - padding;
          const by = veh.y - padding;
          const bw = veh.width + padding * 2;
          const bh = veh.height + padding * 2;

          ctx.strokeRect(bx, by, bw, bh);

          // Top label banner (Class, ID, Conf)
          const labelText = `${veh.class} #${veh.id} | ${veh.confidence}%`;
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
          ctx.fillRect(bx, by - 22, textWidth + 12, 20);

          ctx.fillStyle = '#090d16';
          ctx.fillText(labelText, bx + 6, by - 7);

          // Speed telemetry vector
          if (showSpeed) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(bx + bw - 65, by + bh + 4, 65, 16);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(`${veh.speedKmH} km/h`, bx + bw - 60, by + bh + 16);
          }

          // License Plate Highlight Box
          if (showPlates && veh.plate) {
            const px = veh.x + veh.width / 4;
            const py = veh.y + veh.height - 18;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px, py, veh.width / 2, 14);

            // OCR tag label
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(px, py - 12, 60, 12);
            ctx.fillStyle = '#000';
            ctx.font = '9px monospace';
            ctx.fillText(veh.plate, px + 2, py - 3);
          }
        }
      });

      // Overlay Radar Target Crosshair & Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Camera Watermark & Timestamp
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(10, 10, 220, 48);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.strokeRect(10, 10, 220, 48);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`REC ● [${camera.id}] ${camera.name.slice(0, 16)}...`, 20, 28);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${camera.resolution} | ${camera.fps} FPS | Latency: 18ms`, 20, 46);

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, isPlaying, showBoundingBoxes, showPlates, showSpeed]);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden glass-panel">
      {/* Video Top Control Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <CameraIcon className="w-4 h-4 text-cyan-400" />
              {camera.name} ({camera.id})
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono hidden sm:inline">
            {camera.location}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Overlay Toggles */}
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              showBoundingBoxes
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle YOLO Bounding Boxes"
          >
            YOLO Boxes
          </button>
          <button
            onClick={() => setShowPlates(!showPlates)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              showPlates
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle OCR Plate Highlights"
          >
            ANPR Crops
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={440}
          className="w-full h-auto max-h-[500px] object-cover cursor-crosshair"
        />

        {/* Floating Quick Camera Selector Dropdown */}
        {camerasList.length > 0 && onSelectCamera && (
          <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
            <select
              value={camera.id}
              onChange={(e) => {
                const found = camerasList.find(c => c.id === e.target.value);
                if (found) onSelectCamera(found);
              }}
              className="bg-slate-950 text-slate-200 text-xs font-mono rounded px-2 py-1 border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              {camerasList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name.slice(0, 18)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live AI Overlay Telemetry Watermark */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2">
            <span className="text-cyan-400">YOLOv8x-Custom</span>
            <span>|</span>
            <span className="text-emerald-400">DeepSORT Active</span>
            <span>|</span>
            <span className="text-amber-400">Tesseract OCR</span>
          </div>
        </div>
      </div>

      {/* Bottom Playback & AI Detection Stats */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="text-slate-400 text-[11px]">
            Stream State: <span className="text-emerald-400 font-bold">{isPlaying ? 'LIVE STREAMING' : 'PAUSED'}</span>
          </div>
        </div>

        {/* Realtime detection stats in view */}
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Targets: <strong className="text-cyan-400">5 Vehicles</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Conf: <strong className="text-amber-400">93.4%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bandwidth: <strong className="text-emerald-400">8.4 Mbps</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
