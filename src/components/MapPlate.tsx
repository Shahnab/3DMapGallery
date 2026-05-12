import { useEffect, useState } from "react";
import { CanvasTexture, SRGBColorSpace, LinearMipmapLinearFilter } from "three";
import { generateCityTexture } from "../lib/mapUtils";
import { Loader2 } from "lucide-react";
import { Html } from "@react-three/drei";

export function MapPlate({ mapCanvas }: { mapCanvas: HTMLCanvasElement | null }) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let tex: CanvasTexture | null = null;
    if (mapCanvas) {
      tex = new CanvasTexture(mapCanvas);
      tex.needsUpdate = true;
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      setTexture(tex);
    } else {
      setTexture(null);
    }
    return () => {
      if (tex) tex.dispose();
    };
  }, [mapCanvas]);

  if (!texture) {
    return (
      <group position={[0, -0.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[16, 0.5, 16]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.5} />
        </mesh>
        <Html center position={[0, 0.5, 0]}>
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400 font-mono text-sm tracking-widest uppercase bg-black/50 p-4 rounded-lg backdrop-blur-sm">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-300" />
            Engraving...
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      {/* Frame Backplate */}
      <mesh receiveShadow castShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[17.6, 0.8, 17.6]} />
        <meshStandardMaterial color="#a08040" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Matte Borders (White) */}
      <mesh receiveShadow position={[0, 0.25, -8.4]}>
        <boxGeometry args={[16.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.25, 8.4]}>
        <boxGeometry args={[16.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
      {/* Left/Right */}
      <mesh receiveShadow position={[-8.4, 0.25, 0]}>
        <boxGeometry args={[0.8, 0.1, 16]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[8.4, 0.25, 0]}>
        <boxGeometry args={[0.8, 0.1, 16]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>

      {/* Top Engraved Face */}
      <mesh castShadow receiveShadow position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* High polygon count for displacement to look good */}
        <planeGeometry args={[16, 16, 512, 512]} />
        <meshStandardMaterial
          color="#1a1a1a" 
          map={texture}
          metalness={0.7}
          roughness={0.5}
          displacementMap={texture}
          displacementScale={0.06}
          bumpMap={texture}
          bumpScale={0.03}
          emissiveMap={texture}
          emissive="#66aaff"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
