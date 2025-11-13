// Script to get coordinates for PAUL locations in Baku
// Uses OpenStreetMap Nominatim API (free, no API key needed)

const addresses = [
  'Port Baku Towers, Neftchilar Avenue, Baku, Azerbaijan',
  'Park Bulvar, Mammad Amin Rasulzade Street, Baku, Azerbaijan',
  'Ganjlik Mall, Jafar Jabbarli Street 44, Baku, Azerbaijan',
  '28 Mall, Azadliq Avenue, Baku, Azerbaijan',
  'Caspian Plaza, Khojali Avenue, Baku, Azerbaijan',
  'Deniz Mall, Heydar Aliyev Avenue, Baku, Azerbaijan',
  'Zarifa Aliyeva Street 93, Baku, Azerbaijan',
  'Ministry of Economy, Heydar Aliyev Avenue 155, Baku, Azerbaijan',
  'Crescent Mall, Neftchilar avenue 66, Baku, Azerbaijan',
  'ADA University, Ahmadbey Aghaoghlu 61, Baku, Azerbaijan'
];

async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PAUL-Azerbaijan-App'
      }
    });
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching coordinates for ${address}:`, error);
    return null;
  }
}

async function main() {
  console.log('🗺️ Getting coordinates for PAUL locations...\n');
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    console.log(`${i + 1}. Searching: ${address}`);
    
    const coords = await getCoordinates(address);
    
    if (coords) {
      console.log(`   ✅ Found: [${coords.lat}, ${coords.lon}]`);
      console.log(`   📍 ${coords.display_name}\n`);
    } else {
      console.log(`   ❌ Not found\n`);
    }
    
    // Delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Done!');
}

main();

