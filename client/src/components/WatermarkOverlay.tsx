interface WatermarkOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function addWatermarkToCanvas(canvas: HTMLCanvasElement, isGuest: boolean = true) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Create watermark image
  const watermarkCanvas = document.createElement('canvas');
  watermarkCanvas.width = 250;
  watermarkCanvas.height = 80;
  const watermarkCtx = watermarkCanvas.getContext('2d');
  
  if (!watermarkCtx) return;

  // Draw semi-transparent background
  watermarkCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  watermarkCtx.fillRect(0, 0, 250, 80);

  // Draw text
  watermarkCtx.fillStyle = 'rgba(255, 0, 110, 0.6)';
  watermarkCtx.font = 'bold 14px Arial';
  watermarkCtx.textAlign = 'left';
  watermarkCtx.fillText('chaos.canvas', 10, 25);
  
  if (isGuest) {
    watermarkCtx.fillStyle = 'rgba(0, 245, 255, 0.5)';
    watermarkCtx.font = '12px Arial';
    watermarkCtx.fillText('guest mode', 10, 45);
  }
  
  // Draw border
  watermarkCtx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
  watermarkCtx.lineWidth = 1;
  watermarkCtx.strokeRect(0, 0, 250, 80);

  // Draw watermark in bottom-right corner
  const x = canvas.width - 260;
  const y = canvas.height - 90;
  ctx.drawImage(watermarkCanvas, x, y);
}

export function WatermarkOverlay({ canvasRef }: WatermarkOverlayProps) {
  return null; // This is a utility function, not a visual component
}
