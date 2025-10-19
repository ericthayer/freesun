import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const AVIATION_WEATHER_BASE_URL = 'https://aviationweather.gov/api/data';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const ids = url.searchParams.get('ids');
    const format = url.searchParams.get('format') || 'json';
    const hours = url.searchParams.get('hours');
    const bbox = url.searchParams.get('bbox');

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const validEndpoints = ['metar', 'taf', 'stationinfo'];
    if (!validEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const params = new URLSearchParams();
    if (ids) params.append('ids', ids);
    if (format) params.append('format', format);
    if (hours) params.append('hours', hours);
    if (bbox) params.append('bbox', bbox);
    
    if (endpoint === 'metar') {
      params.append('taf', 'false');
      params.append('date', '');
    } else if (endpoint === 'taf') {
      params.append('taf', 'true');
      params.append('date', '');
    }

    const aviationWeatherUrl = `${AVIATION_WEATHER_BASE_URL}/${endpoint}?${params.toString()}`;
    
    console.log('Proxying request to:', aviationWeatherUrl);

    const aviationResponse = await fetch(aviationWeatherUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Free-Sun-Ballooning-Club/1.0',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!aviationResponse.ok) {
      console.error('Aviation Weather API error:', aviationResponse.status, aviationResponse.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Aviation Weather API error',
          status: aviationResponse.status,
          statusText: aviationResponse.statusText
        }),
        {
          status: aviationResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await aviationResponse.json();
    
    console.log('Aviation Weather API response:', Array.isArray(data) ? `${data.length} items` : typeof data);

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? 'Request timeout' : 'Internal server error',
        details: errorMessage
      }),
      {
        status: isTimeout ? 504 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});