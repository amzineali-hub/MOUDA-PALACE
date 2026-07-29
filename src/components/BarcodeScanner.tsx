import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
  onResult: (decodedText: string, decodedResult: any) => void;
  onError?: (errorMessage: string) => void;
}

export default function BarcodeScanner({ onResult, onError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const lastScanRef = useRef<{ text: string, time: number }>({ text: '', time: 0 });

  useEffect(() => {
    // Initialize the scanner when component mounts
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0], // Html5QrcodeScanType.SCAN_TYPE_CAMERA
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ]
    };
    
    // Check if element exists before initializing
    if (document.getElementById('reader')) {
      scannerRef.current = new Html5QrcodeScanner('reader', config, false);
      
      scannerRef.current.render((decodedText, decodedResult) => {
        const now = Date.now();
        // Prevent scanning the exact same code within 2 seconds
        if (lastScanRef.current.text === decodedText && now - lastScanRef.current.time < 2000) {
          return;
        }
        
        lastScanRef.current = { text: decodedText, time: now };
        onResult(decodedText, decodedResult);
      }, (errorMessage) => {
        if (onError) onError(errorMessage);
      });
    }

    // Cleanup when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear html5QrcodeScanner. ', error);
        });
      }
    };
  }, [onResult, onError]);

  return <div id="reader" className="w-full"></div>;
}
