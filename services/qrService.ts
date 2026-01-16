
import { ScanResult } from '../types';

export const detectType = (data: string): ScanResult['type'] => {
  if (data.startsWith('http://') || data.startsWith('https://')) return 'url';
  if (data.startsWith('WIFI:')) return 'wifi';
  if (data.startsWith('BEGIN:VCARD')) return 'contact';
  // Simple check for numeric codes often used in barcodes (EAN-8, EAN-13, UPC-A)
  if (/^\d{8,14}$/.test(data)) return 'barcode';
  return 'text';
};

export const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.error('Failed to play beep:', e);
  }
};

export const vibrate = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(100);
  }
};
