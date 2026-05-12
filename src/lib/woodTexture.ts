export function generateWoodTexture(): HTMLCanvasElement {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Base wood color
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(0, 0, width, height);

  // Add grain lines
  ctx.lineWidth = 1;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Procedural wood-like noise function
      const nx = x / 50;
      const ny = y / 200;
      
      // Simple sine-based noise for grain
      const noise = Math.sin(nx + ny * 5 + Math.sin(nx * 2 + ny * 10) * 2) * 0.5 + 0.5;
      
      const idx = (y * width + x) * 4;
      
      // Darken base color based on noise
      const brightness = 0.5 + noise * 0.5;
      
      data[idx] = Math.floor(160 * brightness);     
      data[idx + 1] = Math.floor(100 * brightness); 
      data[idx + 2] = Math.floor(60 * brightness); 
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add some vertical striations
  ctx.fillStyle = "rgba(60, 30, 15, 0.15)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const w = Math.random() * 3 + 1;
    ctx.fillRect(x, 0, w, height);
  }

  // Darker edges
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(40, 20, 10, 0.4)");
  gradient.addColorStop(0.1, "rgba(40, 20, 10, 0)");
  gradient.addColorStop(0.9, "rgba(40, 20, 10, 0)");
  gradient.addColorStop(1, "rgba(40, 20, 10, 0.4)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}
