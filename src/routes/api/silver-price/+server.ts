import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    const res = await fetch('https://harga-emas.org/perak', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch silver price page');
    const html = await res.text();
    
    // Find schema markup containing the price
    // E.g., "offers":{"@type":"Offer","availability":"https://schema.org/InStock","price":37970,"priceCurrency":"IDR"}
    const match = html.match(/"price"\s*:\s*(\d+)\s*,\s*"priceCurrency"\s*:\s*"IDR"/);
    if (match && match[1]) {
      const price = parseInt(match[1], 10);
      return json({
        success: true,
        price: price,
        recordedDate: new Date().toISOString().split('T')[0]
      });
    }
    
    // Fallback: search for any occurrence of price in schema or text
    // E.g., "price":37970
    const fallbackMatch = html.match(/"price"\s*:\s*(\d+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      const price = parseInt(fallbackMatch[1], 10);
      // Ensure it's in the correct range for perak per gram (10.000 - 100.000)
      if (price > 10000 && price < 100000) {
        return json({
          success: true,
          price: price,
          recordedDate: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    throw new Error('Could not parse silver price from HTML');
  } catch (err) {
    console.error('Server-side silver fetch error:', err);
    // Return a realistic fallback if the scraping fails
    return json({
      success: false,
      price: 37970, // Fallback price (Rp 37.970/gram)
      error: 'Failed to fetch silver price. Using fallback.',
      recordedDate: new Date().toISOString().split('T')[0]
    });
  }
}
