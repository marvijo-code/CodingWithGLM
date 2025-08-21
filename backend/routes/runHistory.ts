import db, { RunHistory, RunStats } from '../db.ts';

export async function saveRunHistory(req: Request): Promise<Response> {
  try {
    const { prompt, models, results } = await req.json();
    
    if (!prompt || !models || !results) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: prompt, models, results' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const runId = db.saveRunHistory(prompt, models, results);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id: runId } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving run history:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to save run history' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getRunHistory(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let history: RunHistory[];
    
    if (startDate && endDate) {
      history = db.getRunHistoryByDateRange(startDate, endDate, limit);
    } else {
      history = db.getRunHistory(limit, offset);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: history 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting run history:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to get run history' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getRunStats(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const stats = db.getRunStats(startDate || undefined, endDate || undefined);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: stats 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting run stats:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to get run stats' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
