
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanResult, AppSettings } from '../types';
import { detectType, playBeep, vibrate } from '../services/qrService';
import { 
  Maximize, 
  Flashlight, 
  FlashlightOff, 
  Pause, 
  Play,
  CameraOff
} from 'lucide-react';

interface ScannerViewProps {
  onScan: (result: ScanResult) => void;
  settings: AppSettings;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onScan, settings }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "reader";

  const startScanner = useCallback(async () => {
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode(scannerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = (decodedText: string) => {
        if (!isPaused) {
          if (settings.beep) playBeep();
          if (settings.vibrate) vibrate();
          
          onScan({
            id: crypto.randomUUID(),
            data: decodedText,
            timestamp: Date.now(),
            type: detectType(decodedText)
          });
          
          setIsPaused(true);
        }
      };

      try {
        // Primary attempt: Back camera
        await qrScannerRef.current.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {} 
        );
      } catch (firstError: any) {
        // Fallback attempt: Any available camera (e.g. laptop webcam)
        // Only retry if it's a NotFoundError or OverconstrainedError
        if (firstError?.name === 'NotFoundError' || firstError?.name === 'OverconstrainedError') {
          console.warn('Back camera not found, trying fallback to any camera...');
          await qrScannerRef.current.start(
            {}, // No constraints - browser chooses default
            config,
            onScanSuccess,
            () => {}
          );
        } else {
          throw firstError; // Re-throw other errors (like NotAllowedError)
        }
      }
      
      setHasPermission(true);
    } catch (err) {
      console.error('Camera initialization error:', err);
      setHasPermission(false);
    }
  }, [isPaused, onScan, settings]);

  useEffect(() => {
    startScanner();
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, [startScanner]);

  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      try {
        const capabilities = qrScannerRef.current.getRunningTrackCapabilities();
        const hasFlash = (capabilities as any).torch;
        if (hasFlash) {
          await qrScannerRef.current.applyVideoConstraints({
            advanced: [{ torch: !flashOn } as any]
          });
          setFlashOn(!flashOn);
        }
      } catch (e) {
        console.warn('Flashlight not supported');
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <CameraOff className="w-16 h-16 text-zinc-500" />
        <h2 className="text-xl font-semibold">Camera Access Required</h2>
        <p className="text-zinc-400">Please enable camera permissions or connect a camera device to use the scanner.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 rounded-full font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <div id={scannerId} className="h-full w-full" />

      {/* Manual UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="w-72 h-72 border-2 border-indigo-500/50 rounded-2xl relative">
           {!isPaused && (
             <div className="absolute inset-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
           )}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
        </div>
      </div>

      <div className="absolute top-12 inset-x-0 flex justify-center px-4 z-20">
        <p className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
          {isPaused ? 'Scanning Paused' : 'Scan QR or Barcode'}
        </p>
      </div>

      <div className="absolute bottom-24 inset-x-0 flex justify-center items-center space-x-6 z-20">
        <button 
          onClick={toggleFlash}
          className="p-4 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-95 transition-transform"
        >
          {flashOn ? <FlashlightOff size={24} /> : <Flashlight size={24} />}
        </button>
        
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`p-6 ${isPaused ? 'bg-indigo-600' : 'bg-zinc-900/80'} backdrop-blur-md rounded-full border border-white/10 text-white active:scale-95 transition-transform shadow-lg`}
        >
          {isPaused ? <Play size={32} /> : <Pause size={32} />}
        </button>

        <button 
          className="p-4 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-95 transition-transform"
        >
          <Maximize size={24} />
        </button>
      </div>
    </div>
  );
};

export default ScannerView;
