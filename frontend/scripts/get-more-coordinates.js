// More specific searches for missing locations

const searchQueries = [
  'Park Bulvar Shopping Center Baku',
  'Ganjlik Mall Baku',
  'Deniz Mall Baku',
  'Caspian Waterfront Mall Baku',
  'AF Mall Baku Neftchilar',
  'ADA University Baku'
];

async function search(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PAUL-Azerbaijan-App' }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error:`, error);
    return [];
  }
}

async function main() {
  console.log('🔍 Searching for mall coordinates...\n');
  
  for (const query of searchQueries) {
    console.log(`📍 ${query}:`);
    const results = await search(query);
    
    if (results.length > 0) {
      results.forEach((r, idx) => {
        console.log(`   ${idx + 1}. [${r.lat}, ${r.lon}] - ${r.display_name.substring(0, 80)}...`);
      });
    } else {
      console.log('   ❌ Not found');
    }
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();

