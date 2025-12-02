import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, Camera, SwitchCamera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const initScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        startScanning(devices[currentCameraIndex].id);
      } else {
        toast({
          title: "Câmera não encontrada",
          description: "Nenhuma câmera disponível no dispositivo.",
          variant: "destructive"
        });
        onClose();
      }
    } catch (error) {
      console.error("Erro ao inicializar scanner:", error);
      toast({
        title: "Erro ao acessar câmera",
        description: "Não foi possível acessar a câmera do dispositivo.",
        variant: "destructive"
      });
      onClose();
    }
  };

  const startScanning = async (cameraId: string) => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("barcode-reader");
      }

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        (decodedText) => {
          // Som de beep ao escanear
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);

          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (error) => {
          // Ignora erros de leitura contínua
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Erro ao iniciar escaneamento:", error);
      toast({
        title: "Erro ao iniciar scanner",
        description: "Não foi possível iniciar o escaneamento.",
        variant: "destructive"
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error("Erro ao parar scanner:", error);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    await stopScanner();
    const newIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(newIndex);
    await startScanning(cameras[newIndex].id);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Escanear Código de Barras</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div id="barcode-reader" className="w-full h-full" />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-40 border-2 border-white rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions and Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="text-center text-white space-y-4">
          <p className="text-sm">Posicione o código de barras dentro da área marcada</p>
          
          {cameras.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="secondary"
              size="lg"
              className="w-full max-w-xs"
            >
              <SwitchCamera className="h-5 w-5 mr-2" />
              Alternar Câmera
            </Button>
          )}
          
          <div className="flex gap-2 text-xs text-white/60">
            <span>✓ EAN-13</span>
            <span>✓ EAN-8</span>
            <span>✓ UPC-A</span>
            <span>✓ CODE-128</span>
          </div>
        </div>
      </div>
    </div>
  );
}
