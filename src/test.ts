import axios from 'axios';

async function test() {
  try {
    const cleanCountry = "Vatican City State (Holy See)".split('(')[0].trim();
    const city = "Vatican City State (Holy See)".split('(')[0].trim();
    
    // First try free-text query
    const freeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', ' + cleanCountry)}&format=json&limit=1`;
    let res = await axios.get(freeUrl, { headers: { 'User-Agent': 'MyApp/1.0', 'Accept-Language': 'en' } });
    
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
}
test();
