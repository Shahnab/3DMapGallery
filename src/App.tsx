import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PointerLockControls } from "@react-three/drei";
import axios from "axios";
import { Compass, Loader2, Key, Settings, X } from "lucide-react";
import { GalleryRoom } from "./components/GalleryRoom";

export default function App() {
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number; zoom: number; gridSize: number } | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  useEffect(() => {
    // Fetch countries
    axios.get("https://countriesnow.space/api/v0.1/countries")
      .then((res) => {
        if (!res.data.error) {
          // Merge Taiwan into China, filter out Vatican/Holy See, then sort
          let data = res.data.data;
          
          let chinaIndex = data.findIndex((c: any) => c.country === "China");
          let taiwanIndex = data.findIndex((c: any) => c.country === "Taiwan");
          
          if (chinaIndex !== -1 && taiwanIndex !== -1) {
            // Combine cities and sort them
            const combinedCities = Array.from(new Set([...data[chinaIndex].cities, ...data[taiwanIndex].cities]));
            combinedCities.sort();
            data[chinaIndex] = { ...data[chinaIndex], cities: combinedCities };
          }
          
          const sorted = data
            .filter((c: any) => !c.country.includes("Vatican") && !c.country.includes("Holy See") && c.country !== "Taiwan")
            .sort((a: any, b: any) => a.country.localeCompare(b.country));
          setCountriesData(sorted);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryObj = countriesData.find((c) => c.country === selectedCountry);
      if (countryObj) {
        // Sort cities alphabetically, or use country name if no cities provided
        const cities = countryObj.cities && countryObj.cities.length > 0 
          ? [...countryObj.cities].sort() 
          : [countryObj.country];
        setAvailableCities(cities);
        setSelectedCity(cities.length === 1 ? cities[0] : "");
      }
    }
  }, [selectedCountry, countriesData]);

  useEffect(() => {
    if (selectedCity && selectedCountry) {
      setLoadingCoords(true);
      // Clean up country name (e.g. "Vatican City State (Holy See)" -> "Vatican City State")
      const cleanCountry = selectedCountry.split('(')[0].trim();
      
      const executeSearch = (url: string) => axios.get(url, { headers: { 'Accept-Language': 'en' } });

      const structuredUrl = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(selectedCity)}&country=${encodeURIComponent(cleanCountry)}&format=json&limit=1`;
      const freeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedCity + ', ' + cleanCountry)}&format=json&limit=1`;
      const cityOnlyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedCity)}&format=json&limit=1`;

      executeSearch(structuredUrl)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            return res;
          }
          console.warn("Structured query failed, trying free-text...");
          return executeSearch(freeUrl);
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            return res;
          }
          console.warn("Free-text query failed, trying city only...");
          return executeSearch(cityOnlyUrl);
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const data = res.data[0];
            let z = 13;
            let gridSize = 7;

            if (data.boundingbox) {
              const latMin = parseFloat(data.boundingbox[0]);
              const latMax = parseFloat(data.boundingbox[1]);
              const lonMin = parseFloat(data.boundingbox[2]);
              const lonMax = parseFloat(data.boundingbox[3]);
              
              const latDiff = Math.abs(latMax - latMin);
              const lonDiff = Math.abs(lonMax - lonMin);
              
              const marginGrid = 10;
              
              if (lonDiff > 0 && latDiff > 0) {
                const zX = Math.log2((marginGrid * 360) / lonDiff);
                const zY = Math.log2((marginGrid * 180) / latDiff);
                z = Math.floor(Math.min(zX, zY));
                
                // We want good street visibility, but don't clip giant cities
                if (z < 11) z = 11; 
                if (z > 16) z = 16;
              }
              
              // Calculate required grid size for this zoom level
              const tileLon = 360 / Math.pow(2, z);
              const tileLat = 180 / Math.pow(2, z);
              
              let tilesX = Math.ceil(lonDiff / tileLon) + 2; // +2 for borders
              let tilesY = Math.ceil(latDiff / tileLat) + 2; 
              
              gridSize = Math.max(tilesX, tilesY);
              // Make grid size an odd number so it has a true center tile
              if (gridSize % 2 === 0) gridSize += 1;
              
              // Clamp to a reasonably high max to allow high detail maps without failing.
              gridSize = Math.max(5, Math.min(17, gridSize));
            }

            setMapCenter({
              lat: parseFloat(data.lat),
              lon: parseFloat(data.lon),
              zoom: z,
              gridSize: gridSize,
            });
          } else {
             console.warn("Location not found");
          }
        })
        .catch(console.error)
        .finally(() => {
          setLoadingCoords(false);
        });
    }
  }, [selectedCity, selectedCountry]);

  return (
    <div className="w-full h-screen bg-[#0a0a0c] text-white font-sans flex flex-col overflow-hidden select-none">
      
      {/* Header Navigation / Selection Area */}
      <header className="w-full pt-6 md:pt-12 pb-6 px-6 md:px-16 flex flex-col md:flex-row justify-between md:items-end z-10 relative bg-transparent shrink-0 border-b border-white/10 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-1 mb-6 md:mb-0">
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            The Gallery
          </h1>
          <p className="text-2xl font-light tracking-tight text-white">Artistic <span className="font-medium">Showcase</span></p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded shadow-sm">
          <div className="flex flex-col px-4">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Country</span>
            <select
              className="bg-transparent text-sm font-medium outline-none cursor-pointer text-white max-w-[120px] text-ellipsis placeholder-gray-500"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="" className="text-black">Select a country...</option>
              {countriesData.map((c, i) => (
                <option key={`${c.country}-${i}`} value={c.country} className="text-black">{c.country}</option>
              ))}
            </select>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="flex flex-col px-4 relative">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">City</span>
            <div className="relative flex items-center">
              <select
                className="bg-transparent text-sm font-medium outline-none cursor-pointer text-white appearance-none pr-6 max-w-[120px] text-ellipsis"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry || availableCities.length === 0}
              >
                <option value="" className="text-black">Select a city...</option>
                {availableCities.map((city, i) => (
                  <option key={`${city}-${i}`} value={city} className="text-black">{city}</option>
                ))}
              </select>
              {loadingCoords && (
                <Loader2 className="w-3 h-3 animate-spin text-white absolute right-0" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Visualization Area */}
      <main className="flex-1 relative flex items-center justify-center bg-black">
        
        {/* 3D Scene */}
        <div className="w-full h-full absolute inset-0 cursor-move z-0">
          <Canvas shadows camera={{ position: [0, 4, 8], fov: 60 }}>
            {/* Gallery Environment and Lighting is inside GalleryRoom */}
            <GalleryRoom mapCenter={mapCenter} />

            <OrbitControls 
              minDistance={2} 
              maxDistance={7.0} 
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2 - 0.05}
              enablePan={false}
              enableZoom={true}
              autoRotate={false}
              target={[0, 4, 0]}
            />
          </Canvas>
        </div>

      </main>
    </div>
  );
}
