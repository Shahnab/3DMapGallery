import { useState, useEffect } from "react";
import * as THREE from "three";
import { generateCityTexture } from "../lib/mapUtils";

export function PhotoFrame({ 
  position, 
  rotation, 
  mapCanvas,
  sliceIndex 
}: { 
  position: [number, number, number], 
  rotation?: [number, number, number], 
  mapCanvas?: HTMLCanvasElement | null,
  sliceIndex: number 
}) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let tex: THREE.CanvasTexture | null = null;
    if (mapCanvas) {
      tex = new THREE.CanvasTexture(mapCanvas);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;

      // Slice the texture into a 4x4 grid so each slice is a perfect square
      // Left wall gets row 1, Right wall gets row 2
      const cols = 4;
      const rows = 4;
      const x = sliceIndex % 4; // 0 to 3
      const y = Math.floor(sliceIndex / 4) + 1; // 1 (left wall) or 2 (right wall)

      tex.repeat.set(1 / cols, 1 / rows);
      // UV offset: (0,0) is bottom-left. 
      // y=1 means offset (3-1)/4 = 0.5
      // y=2 means offset (3-2)/4 = 0.25
      tex.offset.set(x / cols, (3 - y) * (1 / rows));
      
      setTexture(tex);
    } else {
      setTexture(null);
    }
    
    return () => {
      if (tex) tex.dispose();
    };
  }, [mapCanvas, sliceIndex]);

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Outer frame */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[3.2, 3.2, 0.1]} />
        <meshStandardMaterial color="#a08040" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Matte / Inner border */}
      <mesh position={[0, 0, 0.051]} receiveShadow>
        <planeGeometry args={[3.0, 3.0]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>

      {/* The actual photo */}
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[2.6, 2.6]} />
        {!mapCanvas ? (
          <meshBasicMaterial color="#dddddd" wireframe />
        ) : texture ? (
          <meshStandardMaterial
            color="#1a1a1a" 
            map={texture}
            metalness={0.7}
            roughness={0.5}
            displacementMap={texture}
            displacementScale={0.02}
            bumpMap={texture}
            bumpScale={0.05}
            emissiveMap={texture}
            emissive="#66aaff"
            emissiveIntensity={0.8}
          />
        ) : (
          <meshBasicMaterial color="#662222" />
        )}
      </mesh>
    </group>
  );
}
