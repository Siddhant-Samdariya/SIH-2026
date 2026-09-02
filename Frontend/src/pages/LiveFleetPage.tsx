import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Bus, 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Activity, 
  Radio, 
  SlidersHorizontal,
  Wifi,
  Upload,
  Link as LinkIcon,
  Play,
  Pause,
  FileVideo,
  Plus,
  Check,
  RefreshCw,
  X,
  Eye,
  ShieldCheck,
  Camera,
  Server,
  Zap,
  Layers,
  Settings,
  Inbox
} from 'lucide-react';

interface BusFleetItem {
  id: string;
  number: string;
  ipAddress: string;
  status: 'Online' | 'Offline';
  cameraStatus: string;
  vehiclesDetected: number;
  activeAlerts: number;
  lastSeen: string;
  route: string;
  speed: string;
  location: string;
  protocol: 'RTSP' | 'HTTP/MJPEG' | 'WebRTC' | 'ONVIF';
}

interface SampleVideo {
  name: string;
  url: string;
  description: string;
  category: string;
}

const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    name: 'Urban Traffic & Bus Dashcam',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Front dashcam feed analyzing multi-lane urban traffic flow & vehicle speeds.',
    category: 'Dashcam'
  },
  {
    name: 'Bus Stop CCTV Footage',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'High angle station camera monitoring bus docking and pedestrian crowds.',
    category: 'Station CCTV'
  },
  {
    name: 'Road Infrastructure & Pothole Scan',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description: 'Road surface scan inspecting potholes, cracked asphalt & lane markings.',
    category: 'Infrastructure'
  }
];

export const LiveFleetPage: React.FC = () => {
  const [fleetData, setFleetData] = useState<BusFleetItem[]>([
    {
      id: 'BUS-042',
      number: 'BUS 042',
      ipAddress: '192.168.1.142:554',
      protocol: 'RTSP',
      status: 'Offline',
      cameraStatus: 'Camera Inactive',
      vehiclesDetected: 0,
      activeAlerts: 0,
      lastSeen: 'Idle',
      route: 'Route 12 - 4th Ave',
      speed: '0 MPH',
      location: 'Depot Terminal 1'
    },
    {
      id: 'BUS-018',
      number: 'BUS 018',
      ipAddress: '192.168.1.118:8080',
      protocol: 'HTTP/MJPEG',
      status: 'Offline',
      cameraStatus: 'Camera Inactive',
      vehiclesDetected: 0,
      activeAlerts: 0,
      lastSeen: 'Idle',
      route: 'Route 4 - Ring Road Corridor',
      speed: '0 MPH',
      location: 'Station Road Junction'
    },
    {
      id: 'BUS-031',
      number: 'BUS 031',
      ipAddress: '192.168.1.131:554',
      protocol: 'RTSP',
      status: 'Offline',
      cameraStatus: 'Camera Inactive',
      vehiclesDetected: 0,
      activeAlerts: 0,
      lastSeen: 'Idle',
      route: 'Route 7 - MG Road Express',
      speed: '0 MPH',
      location: 'Depot Terminal 2'
    },
    {
      id: 'BUS-007',
      number: 'BUS 007',
      ipAddress: '192.168.1.107:8554',
      protocol: 'WebRTC',
      status: 'Offline',
      cameraStatus: 'Camera Inactive',
      vehiclesDetected: 0,
      activeAlerts: 0,
      lastSeen: 'Idle',
      route: 'Route 1 - Downtown Express',
      speed: '0 MPH',
      location: 'Central Plaza Crossing'
    },
    {
      id: 'BUS-055',
      number: 'BUS 055',
      ipAddress: '192.168.1.155:554',
      protocol: 'ONVIF',
      status: 'Offline',
      cameraStatus: 'Camera Inactive',
      vehiclesDetected: 0,
      activeAlerts: 0,
      lastSeen: 'Idle',
      route: 'Route 9 - Outer Ring Flyover',
      speed: '0 MPH',
      location: 'North District Bridge'
    }
  ]);

  const [selectedBus, setSelectedBus] = useState<BusFleetItem>(fleetData[0]);

  // Feed Mode: 'fleet' (Default stream), 'ip_camera' (Direct IP Stream), 'video_upload' (Uploaded CCTV video)
  const [feedMode, setFeedMode] = useState<'fleet' | 'ip_camera' | 'video_upload'>('fleet');

  // IP Camera Form State
  const [inputIp, setInputIp] = useState<string>('');
  const [inputProtocol, setInputProtocol] = useState<'RTSP' | 'HTTP/MJPEG' | 'WebRTC' | 'ONVIF'>('RTSP');
  const [cameraPosition, setCameraPosition] = useState<string>('Front Dashcam');
  const [isIpConnected, setIsIpConnected] = useState<boolean>(false);
  const [ipConnectMsg, setIpConnectMsg] = useState<string>('');

  // Video Upload & Player State
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'surveillance' | 'upload' | 'ip_config'>('surveillance');

  // Multi-Model YOLO Processing State
  const [isProcessingVideo, setIsProcessingVideo] = useState<boolean>(false);
  const [detectionSummary, setDetectionSummary] = useState<{
    total_frames?: number;
    duration_seconds?: number;
    processing_time_seconds?: number;
  } | null>(null);

  // New Bus Modal State
  const [editingBusIp, setEditingBusIp] = useState<string | null>(null);
  const [newIpValue, setNewIpValue] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle IP Connection Submit
  const handleConnectIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputIp.trim()) return;

    setIsIpConnected(true);
    setFeedMode('ip_camera');
    setIpConnectMsg(`Connected to ${inputProtocol} stream at ${inputIp}`);
    
    // Update selected bus IP
    setSelectedBus(prev => ({
      ...prev,
      ipAddress: inputIp,
      protocol: inputProtocol,
      cameraStatus: `${cameraPosition} (${inputProtocol})`
    }));

    // Also update in fleet list
    setFleetData(prev => prev.map(bus => 
      bus.id === selectedBus.id 
        ? { ...bus, ipAddress: inputIp, protocol: inputProtocol, cameraStatus: `${cameraPosition} (${inputProtocol})`, status: 'Online' } 
        : bus
    ));
  };

  // Handle File Upload & FastAPI YOLO Model Processing
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(localUrl);
    setUploadedFileName(file.name);
    setFeedMode('video_upload');
    setIsProcessingVideo(true);
    setDetectionSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/api/ai/process-video', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.video_url) {
          setUploadedVideoUrl(data.video_url);
          setDetectionSummary({
            total_frames: data.total_frames,
            duration_seconds: data.duration_seconds,
            processing_time_seconds: data.processing_time_seconds
          });
        }
      }
    } catch (err) {
      console.warn('YOLO Video Processing API connection fallback:', err);
    } finally {
      setIsProcessingVideo(false);
      setIsPlaying(true);
    }
  };

  const handleSelectSampleVideo = (sample: SampleVideo) => {
    setUploadedVideoUrl(sample.url);
    setUploadedFileName(sample.name);
    setFeedMode('video_upload');
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUpdateBusIpSubmit = (busId: string) => {
    if (!newIpValue.trim()) return;
    setFleetData(prev => prev.map(bus => 
      bus.id === busId ? { ...bus, ipAddress: newIpValue, status: 'Online' } : bus
    ));
    if (selectedBus.id === busId) {
      setSelectedBus(prev => ({ ...prev, ipAddress: newIpValue }));
      setInputIp(newIpValue);
    }
    setEditingBusIp(null);
    setNewIpValue('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bus className="w-6 h-6 text-[#1b365d]" />
            Live Bus Surveillance & Fleet IP Cameras
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Connect live bus IP camera streams (RTSP / HTTP / WebRTC) or upload recorded CCTV video for AI Computer Vision analysis.
          </p>
        </div>

        {/* Quick Mode Switcher Pills (2 Sections) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFeedMode('fleet')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              feedMode === 'fleet'
                ? 'bg-[#1b365d] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Live Fleet Feed
          </button>

          <button
            onClick={() => setFeedMode('video_upload')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              feedMode === 'video_upload'
                ? 'bg-[#1b365d] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CCTV Video
          </button>
        </div>
      </div>

      {/* Top Section Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Buses</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">0</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> 0 Connected
          </p>
        </div>

        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active IP Camera Streams</p>
          <h3 className="text-3xl font-extrabold text-[#1b365d] mt-1">0</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-slate-400" /> 0 Streams Online
          </p>
        </div>

        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Feed Bandwidth</p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1">0 <span className="text-sm font-normal text-slate-500">Mbps</span></h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Avg Latency: 0ms</p>
        </div>

        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alerts Today</p>
          <h3 className="text-3xl font-extrabold text-amber-600 mt-1">0</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">No alerts recorded</p>
        </div>
      </div>

      {/* IP CAMERA INPUT CONTROLS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-lg bg-[#1b365d] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Wifi className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              ADD BUS CAMERA IP / CONNECT LIVE STREAM
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure RTSP / HTTP IP stream connection for live UrbanSense AI computer vision telemetry
            </p>
          </div>
        </div>

        <form onSubmit={handleConnectIp} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Section 1: IP Input */}
          <div className="md:col-span-8 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-[#1b365d]" />
              CAMERA IP ADDRESS / STREAM URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                placeholder="e.g. 192.168.1.142:554/live"
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#1b365d] focus:bg-white rounded-lg px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
              />
              <LinkIcon className="w-4 h-4 text-[#1b365d] absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Section 2: Camera Position */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              CAMERA VIEW
            </label>
            <select
              value={cameraPosition}
              onChange={(e) => setCameraPosition(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#1b365d] focus:bg-white rounded-lg px-3 py-2.5 text-xs font-sans font-semibold text-slate-800 focus:outline-none transition-all"
            >
              <option value="Front Dashcam">Front Dashcam</option>
              <option value="Rear Door View">Rear Door View</option>
              <option value="Driver Monitor">Driver Monitor</option>
              <option value="Cabin Interior">Cabin Interior</option>
            </select>
          </div>
        </form>
      </div>

      {/* CCTV FOOTAGE / VIDEO UPLOAD SECTION & PLAYER AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Column: Surveillance / Upload Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="urbansense-card p-4 space-y-4">
            
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1b365d] text-white flex items-center justify-center font-bold text-xs">
                  {feedMode === 'video_upload' ? <FileVideo className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {feedMode === 'video_upload' 
                      ? (uploadedFileName ? `CCTV File: ${uploadedFileName}` : 'CCTV Video Analysis')
                      : feedMode === 'ip_camera'
                      ? `IP Camera Stream (${inputIp})`
                      : `${selectedBus.number} Live Surveillance`
                    }
                  </h3>
                  <p className="text-xs text-slate-500">
                    {feedMode === 'video_upload'
                      ? 'Local CCTV Footage • Offline Computer Vision AI Processing'
                      : feedMode === 'ip_camera'
                      ? `IP Stream Connected • ${selectedBus.route}`
                      : `${selectedBus.route} • IP: ${selectedBus.ipAddress}`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    showAiOverlay
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showAiOverlay ? 'AI Boxes ON' : 'AI Boxes OFF'}
                </button>

                <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase ${
                  selectedBus.status === 'Online' || feedMode === 'video_upload'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {feedMode === 'video_upload' ? 'FILE READY' : selectedBus.status}
                </span>
              </div>
            </div>

            {/* VIDEO DISPLAY AREA */}
            {feedMode === 'video_upload' && uploadedVideoUrl ? (
              <>
                {/* HTML5 Video Player for uploaded CCTV File */}
                <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-[16/9] flex items-center justify-center shadow-inner group">
                  <video
                    ref={videoRef}
                    src={uploadedVideoUrl}
                    controls
                    autoPlay
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-contain"
                  />

                  {/* Loading Banner when Running Multi-Model YOLO Pipeline */}
                  {isProcessingVideo && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-40 flex flex-col items-center justify-center gap-3 text-white p-6">
                      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-center space-y-1.5">
                        <h4 className="font-bold text-base text-cyan-300 tracking-wide">
                          Executing Multi-Model YOLO Computer Vision Pipeline...
                        </h4>
                        <p className="text-xs text-slate-300 font-mono">
                          Running Potholes.pt + Road_Damage.pt + Vehicle_Pedestrian.pt
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Optional AI Computer Vision Box Overlay */}
                  {showAiOverlay && !isProcessingVideo && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Live Processing Watermark */}
                      <div className="absolute top-3 left-3 bg-slate-900/90 text-white px-3 py-1 rounded-md text-xs font-mono border border-slate-700 flex items-center gap-1.5 shadow-md">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>YOLO Multi-Model Output Stream</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-Model AI Video Processing Metrics Bar */}
                {detectionSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-xs font-mono shadow-sm">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">Total Video Frames</span>
                      <span className="text-cyan-400 font-extrabold text-base">{detectionSummary.total_frames || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">Video Duration</span>
                      <span className="text-emerald-400 font-extrabold text-base">{detectionSummary.duration_seconds ? `${detectionSummary.duration_seconds}s` : 'N/A'}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase">AI Pipeline Status</span>
                      <span className="text-amber-400 font-extrabold text-base">Active (GPU)</span>
                    </div>
                  </div>
                )}
              </>
            ) : feedMode === 'video_upload' && !uploadedVideoUrl ? (
              /* Empty Video Upload Dropzone */
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-blue-50/40 transition-colors">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Upload Bus CCTV Footage or Dashcam Video</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Drag and drop recorded video files (.mp4, .avi, .mov, .mkv) to run offline AI detection for vehicles, license plates, and road damage.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1b365d] hover:bg-[#152a4a] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    Browse Video Files
                  </button>
                </div>
              </div>
            ) : (
              /* Default Fleet / IP Live Stream View */
              <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-[16/9] sm:aspect-[4/3] flex flex-col items-center justify-center text-slate-400 shadow-inner p-6">
                <Video className="w-12 h-12 text-slate-600 mb-2" />
                <h4 className="font-bold text-slate-200 text-sm">No live video available</h4>
                <p className="text-xs text-slate-500 mt-1 text-center max-w-xs font-sans">
                  Select a live bus camera stream or upload video footage to view computer vision telemetry.
                </p>
              </div>
            )}

            {/* Uploaded File Info or Sample Video Chooser */}
            {feedMode === 'video_upload' && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileVideo className="w-4 h-4 text-blue-600" />
                    Or Select Pre-Loaded CCTV Sample Video
                  </h4>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                  >
                    + Upload custom video file
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_VIDEOS.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => handleSelectSampleVideo(sample)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        uploadedFileName === sample.name
                          ? 'bg-blue-50 border-blue-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase font-mono text-blue-600">
                          {sample.category}
                        </span>
                        {uploadedFileName === sample.name && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-xs mt-1 truncate">{sample.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{sample.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Telemetry & AI Alerts Log */}
        <div className="space-y-4">
          <div className="urbansense-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Real-time Telemetry & AI Alerts</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="py-12 text-center space-y-2 font-sans text-slate-400">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No telemetry alerts recorded</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Real-time alerts will appear here when active camera streams detect anomalies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONNECTED FLEET BUS TABLE WITH IP ADDRESS COLUMN */}
      <div className="urbansense-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Connected UrbanSense Fleet & IP Camera Registry</h3>
            <p className="text-xs text-slate-500">
              Manage camera IP addresses, streaming protocols, and select buses to inspect computer vision telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              {fleetData.length} Registered Fleet Nodes
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Bus ID</th>
                <th className="py-3 px-5">Camera IP Address</th>
                <th className="py-3 px-5">Protocol</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Camera View</th>
                <th className="py-3 px-5">Detections Today</th>
                <th className="py-3 px-5">Alerts</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-sans">
              {fleetData.map((bus) => {
                const isSelected = selectedBus.id === bus.id && feedMode !== 'video_upload';
                const isEditingThis = editingBusIp === bus.id;

                return (
                  <tr
                    key={bus.id}
                    onClick={() => {
                      setSelectedBus(bus);
                      setInputIp(bus.ipAddress);
                      setInputProtocol(bus.protocol);
                      setFeedMode('fleet');
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100/90 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Bus ID */}
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-[#1b365d]" />
                        <span>{bus.id}</span>
                      </div>
                    </td>

                    {/* Camera IP Address Field */}
                    <td className="py-3.5 px-5 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newIpValue}
                            onChange={(e) => setNewIpValue(e.target.value)}
                            className="bg-white border border-blue-500 rounded px-2 py-1 text-xs font-mono text-slate-900 w-36 focus:outline-none"
                            placeholder="192.168.x.x:554"
                          />
                          <button
                            onClick={() => handleUpdateBusIpSubmit(bus.id)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingBusIp(null)}
                            className="bg-slate-200 text-slate-700 p-1 rounded hover:bg-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-700 font-semibold bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                            {bus.ipAddress}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBusIp(bus.id);
                              setNewIpValue(bus.ipAddress);
                            }}
                            className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Protocol */}
                    <td className="py-3.5 px-5 text-xs font-mono font-semibold text-slate-600">
                      {bus.protocol}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        bus.status === 'Online'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        ● {bus.status}
                      </span>
                    </td>

                    {/* Camera Status View */}
                    <td className="py-3.5 px-5 text-slate-700 text-xs">
                      {bus.cameraStatus}
                    </td>

                    {/* Detections */}
                    <td className="py-3.5 px-5 text-slate-900 font-semibold text-xs">
                      {bus.vehiclesDetected} detected
                    </td>

                    {/* Alerts */}
                    <td className="py-3.5 px-5 text-xs">
                      {bus.activeAlerts > 0 ? (
                        <span className="text-amber-700 font-bold">{bus.activeAlerts} alerts</span>
                      ) : (
                        <span className="text-slate-400">0 alerts</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBus(bus);
                            setInputIp(bus.ipAddress);
                            setInputProtocol(bus.protocol);
                            setFeedMode('ip_camera');
                            setIpConnectMsg(`Connected to ${bus.id} IP stream (${bus.ipAddress})`);
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-colors flex items-center gap-1"
                        >
                          <Wifi className="w-3 h-3" />
                          Connect IP
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBus(bus);
                            setFeedMode('fleet');
                          }}
                          className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${
                            isSelected && feedMode === 'fleet'
                              ? 'bg-[#1b365d]'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && feedMode === 'fleet' ? 'Viewing' : 'View Stream'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveFleetPage;
