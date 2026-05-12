export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export async function generateCityTexture(
  lat: number,
  lon: number,
  zoom: number = 14,
  gridSize: number = 7
): Promise<HTMLCanvasElement> {
  const cx = lon2tile(lon, zoom);
  const cy = lat2tile(lat, zoom);

  const canvas = document.createElement("canvas");
  const TILE_SIZE = 256;
  const GRID_SIZE = gridSize;
  canvas.width = TILE_SIZE * GRID_SIZE;
  canvas.height = TILE_SIZE * GRID_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) return canvas;

  const promises = [];
  const halfGrid = Math.floor(GRID_SIZE / 2);
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = cx - halfGrid + i;
      const y = cy - halfGrid + j;
      const url = `https://basemaps.cartocdn.com/dark_nolabels/${zoom}/${x}/${y}.png`;
      promises.push(
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            resolve();
          };
          img.onerror = () => {
            ctx.fillStyle = "#111"; // dark fallback
            ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            resolve();
          };
          img.src = url;
        })
      );
    }
  }

  await Promise.all(promises);

  // Normalize and enhance the image for bump/displacement
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (avg < min) min = avg;
    if (avg > max) max = avg;
  }

  const range = max - min || 1;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Normalize to 0-1
    let n = (avg - min) / range;
    
    // Boost mid-tones to make smaller streets more visible
    n = Math.pow(n, 0.7);
    
    // Stronger contrast to separate roads from the background clearly
    n = smoothstep(0.1, 0.6, n);
    
    // Dark base for blocks/water
    const qb_r = 8, qb_g = 10, qb_b = 12;
    // Bright silver/white for streets
    const sv_r = 255, sv_g = 255, sv_b = 255;

    data[i]     = qb_r + n * (sv_r - qb_r);
    data[i + 1] = qb_g + n * (sv_g - qb_g);
    data[i + 2] = qb_b + n * (sv_b - qb_b);
    data[i + 3] = 255; // Ensure alpha is always solid
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
