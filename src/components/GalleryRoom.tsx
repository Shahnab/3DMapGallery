import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PhotoFrame } from './PhotoFrame';
import { MapPlate } from './MapPlate';
import { Html, Text } from "@react-three/drei";
import { generateCityTexture } from '../lib/mapUtils';
import { generateWoodTexture } from '../lib/woodTexture';

const ropeCurve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, -0.3, 0),
  new THREE.Vector3(1, 0, 0)
);

export function GalleryRoom({ 
  mapCenter, 
}: { 
  mapCenter: any, 
}) {
  const [mapCanvas, setMapCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const woodTexture = useMemo(() => {
    const canvas = generateWoodTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const woodFrameMaterial = <meshStandardMaterial color="#cccccc" map={woodTexture} roughness={0.9} />;
  const woodPanelMaterial = <meshStandardMaterial color="#ffffff" map={woodTexture} roughness={0.8} />;
  const woodBevelMaterial = <meshStandardMaterial color="#eeeeee" map={woodTexture} roughness={0.7} />;

  useEffect(() => {
    let isMounted = true;
    if (mapCenter) {
      setMapCanvas(null);
      generateCityTexture(mapCenter.lat, mapCenter.lon, mapCenter.zoom, mapCenter.gridSize).then((canvas) => {
        if (isMounted) setMapCanvas(canvas);
      }).catch(console.error);
    }
    return () => { isMounted = false; };
  }, [mapCenter]);

  const wallMaterial = <meshStandardMaterial color="#fafafa" roughness={0.8} metalness={0.05} />;
  const floorMaterial = (
    <meshPhysicalMaterial 
      color="#0a0a0c" 
      roughness={0.1} 
      metalness={0.3} 
      clearcoat={1} 
      clearcoatRoughness={0.2} 
    />
  );
  const ceilingMaterial = <meshStandardMaterial color="#0f0f11" roughness={0.9} />;
  
  // 4 positions along Z axis for frames
  const zPositions = [-6, -2, 2, 6];

  return (
    <group>
      {/* Front Wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.2]} />
        {wallMaterial}
      </mesh>

      {/* Back Wall */}
      {/* Back Wall Pieces (Left, Right, Top) to create Doorway */}
      <mesh position={[-5.8, 5, 10]} receiveShadow>
        <boxGeometry args={[8.4, 10, 0.2]} />
        {wallMaterial}
      </mesh>
      <mesh position={[5.8, 5, 10]} receiveShadow>
        <boxGeometry args={[8.4, 10, 0.2]} />
        {wallMaterial}
      </mesh>
      <mesh position={[0, 7.5, 10]} receiveShadow>
        <boxGeometry args={[3.2, 5, 0.2]} />
        {wallMaterial}
      </mesh>

      {/* Wooden Double Doors */}
      <group position={[0, 0, 9.9]}>
        <pointLight position={[0, 4, -2]} intensity={2.5} distance={15} color="#ffeedd" />
        {/* Outer Door Frame / Architrave */}
        <mesh position={[-1.7, 2.5, 0.12]}>
          <boxGeometry args={[0.2, 5.2, 0.05]} />
          {woodFrameMaterial}
        </mesh>
        <mesh position={[1.7, 2.5, 0.12]}>
          <boxGeometry args={[0.2, 5.2, 0.05]} />
          {woodFrameMaterial}
        </mesh>
        <mesh position={[0, 5.1, 0.12]}>
          <boxGeometry args={[3.6, 0.2, 0.05]} />
          {woodFrameMaterial}
        </mesh>
        
        {/* Inner Door Jamb */}
        <mesh position={[-1.65, 2.5, 0]}>
          <boxGeometry args={[0.1, 5, 0.3]} />
          {woodFrameMaterial}
        </mesh>
        <mesh position={[1.65, 2.5, 0]}>
          <boxGeometry args={[0.1, 5, 0.3]} />
          {woodFrameMaterial}
        </mesh>
        <mesh position={[0, 5.05, 0]}>
          <boxGeometry args={[3.4, 0.1, 0.3]} />
          {woodFrameMaterial}
        </mesh>

        {/* Left Door */}
        <group position={[-1.6, 2.5, 0]}>
          <group position={[0.8, 0, 0]}>
            {/* Slab */}
            <mesh>
              <boxGeometry args={[1.58, 4.96, 0.1]} />
              {woodPanelMaterial}
            </mesh>
            
            {/* Top Outer Trim */}
            <mesh position={[0, 1.25, 0.06]}>
              <boxGeometry args={[1.1, 2, 0.04]} />
              {woodFrameMaterial}
            </mesh>
            {/* Top Inner Bevel */}
            <mesh position={[0, 1.25, 0.08]}>
              <boxGeometry args={[0.9, 1.8, 0.02]} />
              {woodBevelMaterial}
            </mesh>
            {/* Top Center Panel */}
            <mesh position={[0, 1.25, 0.09]}>
              <boxGeometry args={[0.7, 1.6, 0.02]} />
              {woodPanelMaterial}
            </mesh>

            {/* Bottom Outer Trim */}
            <mesh position={[0, -1.25, 0.06]}>
              <boxGeometry args={[1.1, 2, 0.04]} />
              {woodFrameMaterial}
            </mesh>
            {/* Bottom Inner Bevel */}
            <mesh position={[0, -1.25, 0.08]}>
              <boxGeometry args={[0.9, 1.8, 0.02]} />
              {woodBevelMaterial}
            </mesh>
            {/* Bottom Center Panel */}
            <mesh position={[0, -1.25, 0.09]}>
              <boxGeometry args={[0.7, 1.6, 0.02]} />
              {woodPanelMaterial}
            </mesh>

            {/* Hardware - Backplate */}
            <mesh position={[0.65, 0, 0.06]}>
              <boxGeometry args={[0.1, 0.4, 0.01]} />
              <meshStandardMaterial color="#8a733f" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Hardware - Knob */}
            <mesh position={[0.65, 0, 0.1]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#ab9258" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.65, 0, 0.07]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08]} />
              <meshStandardMaterial color="#ab9258" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Right Door */}
        <group position={[1.6, 2.5, 0]}>
          <group position={[-0.8, 0, 0]}>
            {/* Slab */}
            <mesh>
              <boxGeometry args={[1.58, 4.96, 0.1]} />
              {woodPanelMaterial}
            </mesh>
            
            {/* Top Outer Trim */}
            <mesh position={[0, 1.25, 0.06]}>
              <boxGeometry args={[1.1, 2, 0.04]} />
              {woodFrameMaterial}
            </mesh>
            {/* Top Inner Bevel */}
            <mesh position={[0, 1.25, 0.08]}>
              <boxGeometry args={[0.9, 1.8, 0.02]} />
              {woodBevelMaterial}
            </mesh>
            {/* Top Center Panel */}
            <mesh position={[0, 1.25, 0.09]}>
              <boxGeometry args={[0.7, 1.6, 0.02]} />
              {woodPanelMaterial}
            </mesh>

            {/* Bottom Outer Trim */}
            <mesh position={[0, -1.25, 0.06]}>
              <boxGeometry args={[1.1, 2, 0.04]} />
              {woodFrameMaterial}
            </mesh>
            {/* Bottom Inner Bevel */}
            <mesh position={[0, -1.25, 0.08]}>
              <boxGeometry args={[0.9, 1.8, 0.02]} />
              {woodBevelMaterial}
            </mesh>
            {/* Bottom Center Panel */}
            <mesh position={[0, -1.25, 0.09]}>
              <boxGeometry args={[0.7, 1.6, 0.02]} />
              {woodPanelMaterial}
            </mesh>

            {/* Hardware - Backplate */}
            <mesh position={[-0.65, 0, 0.06]}>
              <boxGeometry args={[0.1, 0.4, 0.01]} />
              <meshStandardMaterial color="#8a733f" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Hardware - Knob */}
            <mesh position={[-0.65, 0, 0.1]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#ab9258" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[-0.65, 0, 0.07]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08]} />
              <meshStandardMaterial color="#ab9258" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Back Wall Text */}
      <group position={[0, 6, 9.85]} rotation={[0, Math.PI, 0]}>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.25}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.6}
        >
          <meshBasicMaterial color="#777777" />
          CONCEPT BY
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={1.4}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
        >
          <meshBasicMaterial color="#aaaaaa" />
          SHAHNAB
        </Text>
      </group>


      
      {/* Left Wall */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        {wallMaterial}
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        {wallMaterial}
      </mesh>

      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        {floorMaterial}
      </mesh>
      
      {/* Gallery Center Rug */}
      <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 10, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        {ceilingMaterial}
      </mesh>
      
      {/* Skylight features */}
      <mesh position={[0, 9.99, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 10]} />
        <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Planters in the corners */}
      {[[-9.2, -9.2], [9.2, -9.2], [-9.2, 9.2], [9.2, 9.2]].map(([x, z], i) => (
        <group key={`planter-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.8, 16]} />
            <meshStandardMaterial color="#cbcbcb" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#2d4c1e" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Stanchions in front of main map feature */}
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={`stanchion-${i}`} position={[x, 0, -8]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.03, 0.15, 1]} />
            <meshStandardMaterial color="#aa9562" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#aa9562" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Velvet ropes connecting stanchions */}
      {[-2, 0, 2].map((x, i) => (
        <group key={`rope-${i}`} position={[x, 0.9, -8]}>
          <mesh castShadow>
            <tubeGeometry args={[ropeCurve, 20, 0.02, 8, false]} />
            <meshStandardMaterial color="#880000" roughness={0.9} />
          </mesh>
          {/* Rope ends (golden clips) */}
          <mesh position={[-0.98, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05]} />
            <meshStandardMaterial color="#aa9562" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0.98, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05]} />
            <meshStandardMaterial color="#aa9562" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Architectural Columns separating exhibits */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`cols-${i}`}>
          {/* Left Column */}
          <mesh position={[-9.6, 5, z]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 10, 0.8]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
          </mesh>
          {/* Left Column Uplight */}
          <pointLight position={[-9.2, 0.5, z]} intensity={5} distance={4} color="#ffedd6" />
          
          {/* Right Column */}
          <mesh position={[9.6, 5, z]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 10, 0.8]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
          </mesh>
          {/* Right Column Uplight */}
          <pointLight position={[9.2, 0.5, z]} intensity={5} distance={4} color="#ffedd6" />
        </group>
      ))}

      {/* Abstract Sculptures on Pedestals */}
      <group position={[-5, 0, -4]}>
        {/* Pedestal */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.2, 0.8]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Sculpture: Topographic Layers */}
        <group position={[0, 1.2, 0]}>
          {/* Layer 1 */}
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.45, 0.1, 32]} />
            <meshPhysicalMaterial color="#ceb794" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Layer 2 */}
          <mesh position={[0.05, 0.15, -0.05]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
            <meshPhysicalMaterial color="#b8a180" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Layer 3 */}
          <mesh position={[-0.05, 0.25, 0.05]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 32]} />
            <meshPhysicalMaterial color="#ceb794" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Layer 4 */}
          <mesh position={[0.08, 0.35, -0.02]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.15, 0.1, 32]} />
            <meshPhysicalMaterial color="#b8a180" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Abstract Map Pin */}
          <group position={[0.08, 0.55, -0.02]}>
            <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#aa3333" roughness={0.2} metalness={0.4} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.005, 0.02, 0.2]} />
              <meshStandardMaterial color="#aa3333" roughness={0.2} metalness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      <group position={[5, 0, 4]}>
        {/* Pedestal */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.0, 32]} />
          <meshStandardMaterial color="#e5e5e5" roughness={0.9} />
        </mesh>
        {/* Sculpture: Spatial Coordinate Planes (GIS abstract) */}
        <group position={[0, 1.5, 0]} rotation={[0, Math.PI / 6, 0]}>
          {/* Grid Planes */}
          <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.02]} />
            <meshPhysicalMaterial color="#5599ff" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
          </mesh>
          <mesh castShadow receiveShadow rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.02]} />
            <meshPhysicalMaterial color="#5599ff" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
          </mesh>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.02]} />
            <meshPhysicalMaterial color="#5599ff" transparent opacity={0.6} metalness={0.5} roughness={0.1} />
          </mesh>
          {/* Central Data Node */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
          {/* Orbiting Data Points */}
          <mesh castShadow receiveShadow position={[0.3, 0.3, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.2, -0.3, 0.2]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Connection Line */}
          <mesh castShadow receiveShadow position={[0.05, 0, 0.1]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.005, 0.005, 0.6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>

      {/* Bench in the Center */}
      <group position={[0, 0, 0]}>
        {/* Bench seat */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.15, 1.2]} />
          <meshPhysicalMaterial color="#ceb794" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Bench legs */}
        <mesh position={[-1.7, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.6, 1.0]} />
          <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[1.7, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.6, 1.0]} />
          <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Information Stand */}
      <group position={[-3, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 6, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#444444" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.05, 0.026]} rotation={[-Math.PI / 6, 0, 0]}>
          <planeGeometry args={[0.55, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <group position={[0, 1.06, 0.027]} rotation={[-Math.PI / 6, 0, 0]}>
          <Text position={[0, 0.1, 0]} fontSize={0.03} color="#000" anchorX="center" anchorY="middle" letterSpacing={0.1}>
            EXPLORE THE CITY
          </Text>
          <Text position={[0, -0.05, 0]} fontSize={0.02} color="#555" anchorX="center" anchorY="middle" maxWidth={0.5} textAlign="center">
            Explore the different topography and mapping features of the selected city.
          </Text>
        </group>
      </group>

      {/* Baseboards */}
      <mesh position={[0, 0.15, -9.9]} receiveShadow castShadow>
        <boxGeometry args={[19.8, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Back Wall Baseboards (Split for Door) */}
      <mesh position={[-5.8, 0.15, 9.9]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[5.8, 0.15, 9.9]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[-9.9, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.3, 20]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[9.9, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.3, 20]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Main Wall Content - MapPlate */}
      <group position={[0, 5, -9.7]} rotation={[Math.PI / 2, 0, 0]} scale={0.48}>
        {mapCenter ? (
          <MapPlate mapCanvas={mapCanvas} />
        ) : (
          <Html center rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} zIndexRange={[10, 0]} transform>
            <div className="bg-black/80 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-lg text-center select-none shadow-2xl">
               <h2 className="text-xl font-light tracking-widest uppercase mb-2">Welcome to the Gallery</h2>
               <p className="text-sm text-gray-400 font-medium tracking-wide">Please select a country and city to curate the exhibition.</p>
            </div>
          </Html>
        )}
      </group>

      {/* Left Wall Frames */}
      {zPositions.map((z, i) => (
        <group key={`left-${i}`}>
          <PhotoFrame
            position={[-9.8, 5, z]}
            rotation={[0, Math.PI / 2, 0]}
            mapCanvas={mapCanvas}
            sliceIndex={i}
          />
          {/* Info Placard */}
          <group position={[-9.85, 4.4, z + 1.2]} rotation={[0, Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.3, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            <Text position={[0, 0.05, 0.03]} fontSize={0.04} color="#111" anchorX="center">
              REGION {i + 1}
            </Text>
            <Text position={[0, -0.05, 0.03]} fontSize={0.02} color="#555" anchorX="center">
              Cartographic View
            </Text>
          </group>
        </group>
      ))}

      {/* Right Wall Frames */}
      {zPositions.map((z, i) => (
        <group key={`right-${i}`}>
          <PhotoFrame
            position={[9.8, 5, z]}
            rotation={[0, -Math.PI / 2, 0]}
            mapCanvas={mapCanvas}
            sliceIndex={(3 - i) + 4}
          />
          {/* Info Placard */}
          <group position={[9.85, 4.4, z - 1.2]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.3, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            <Text position={[0, 0.05, 0.03]} fontSize={0.04} color="#111" anchorX="center">
              REGION {(3 - i) + 5}
            </Text>
            <Text position={[0, -0.05, 0.03]} fontSize={0.02} color="#555" anchorX="center">
              Cartographic View
            </Text>
          </group>
        </group>
      ))}

      {/* Gallery Lighting & Fixtures */}
      {/* Light Tracks */}
      <mesh position={[-6.5, 9.9, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.2, 18]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[6.5, 9.9, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.2, 18]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      
      {/* Lights on Left Wall */}
      {zPositions.map((z, i) => (
        <group key={`light-l-${i}`} position={[-6.5, 9.5, z]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.15, 0.15, 0.4]} />
            <meshStandardMaterial color="#555555" roughness={0.5} />
          </mesh>
          <pointLight position={[-0.5, -0.5, 0]} intensity={45} distance={15} decay={2} color="#fffcf5" castShadow />
        </group>
      ))}

      {/* Lights on Right Wall */}
      {zPositions.map((z, i) => (
        <group key={`light-r-${i}`} position={[6.5, 9.5, z]}>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.15, 0.15, 0.4]} />
            <meshStandardMaterial color="#555555" roughness={0.5} />
          </mesh>
          <pointLight position={[0.5, -0.5, 0]} intensity={45} distance={15} decay={2} color="#fffcf5" castShadow />
        </group>
      ))}

      {/* Center Spotlight track for Main Feature and Text */}
      <mesh position={[0, 9.9, 0]} receiveShadow rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 0.2, 18]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>

      {/* Spotlight on MapPlate */}
      <group position={[0, 9.5, -5]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#555555" roughness={0.5} />
        </mesh>
        <pointLight position={[0, -0.5, -1]} intensity={60} distance={20} decay={2} color="#ffffff" castShadow />
      </group>

      {/* Spotlight on back wall Text */}
      <group position={[0, 9.5, 6]}>
        <mesh rotation={[-Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#555555" roughness={0.5} />
        </mesh>
        <pointLight position={[0, -0.5, 1]} intensity={40} distance={15} decay={2} color="#f0f5ff" castShadow />
      </group>
      
      {/* Overhead Ambient/Fill */}
      <ambientLight intensity={0.4} color="#eef" />
      {/* Subtle directional light for depth */}
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
    </group>
  );
}
