import React, { useState } from 'react';
import { X, Copy, Check, Download, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://18esimo-game.local';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-amber-500/30 p-6 shadow-2xl relative text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6 text-amber-400" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          Fai Entrare un Amico!
        </h2>
        <p className="text-xs text-zinc-400 mb-5">
          Fai inquadrare questo QR Code con la fotocamera del telefono per giocare subito.
        </p>

        {/* QR Code Container */}
        <div className="mx-auto w-64 h-64 p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/40 flex items-center justify-center mb-5">
          <img
            src={qrUrl}
            alt="QR Code per accedere al gioco del 18esimo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-xs font-mono text-zinc-400 truncate mb-4 px-2 py-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
          {currentUrl}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all border border-zinc-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copiato!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copia Link</span>
              </>
            )}
          </button>

          <a
            href={qrUrl}
            download="qr-code-18esimo.png"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-zinc-950 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Salva QR</span>
          </a>
        </div>
      </div>
    </div>
  );
};
