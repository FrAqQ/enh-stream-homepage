
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ping } from "https://deno.land/x/ping@0.2.1/mod.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { host } = await req.json();
    
    if (!host) {
      return new Response(
        JSON.stringify({ error: 'Host is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    try {
      const pingResult = await ping(host, 2); // 2 seconds timeout
      return new Response(
        JSON.stringify({ 
          success: true,
          alive: pingResult.alive,
          time: pingResult.time 
        }),
        { 
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false,
          alive: false,
          error: error.message 
        }),
        { 
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
