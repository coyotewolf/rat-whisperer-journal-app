import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { forceRefresh } = await req.json();

    // Check cache first
    if (!forceRefresh) {
      const { data: cachedData } = await supabaseClient
        .from('health_alerts_cache')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedData) {
        const cacheAge = Date.now() - new Date(cachedData.created_at).getTime();
        if (cacheAge < 3600000) { // 1 hour
          console.log('Returning cached analysis');
          return new Response(JSON.stringify({ 
            ...cachedData.analysis_data,
            cached: true,
            cache_age_minutes: Math.round(cacheAge / 60000)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Fetch all rats
    const { data: rats } = await supabaseClient
      .from('rats')
      .select('*')
      .eq('user_id', user.id);

    if (!rats || rats.length === 0) {
      return new Response(JSON.stringify({
        alerts: [],
        overall_status: 'success',
        summary: 'No rats added yet'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all log entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs } = await supabaseClient
      .from('log_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!logs || logs.length === 0) {
      const result = {
        alerts: [{
          id: 'no-logs',
          type: 'info',
          title: 'No Activity Data',
          message: 'Start logging activities to get AI health insights',
          icon: 'Info',
          priority: 1,
          action_needed: false
        }],
        overall_status: 'info',
        summary: 'No activity logs found in the last 30 days'
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for AI analysis
    const weightLogs = logs.filter(log => log.type === 'weight');
    const healthLogs = logs.filter(log => log.type === 'health');
    const behaviorLogs = logs.filter(log => log.type === 'behavior');
    const medicationLogs = logs.filter(log => log.type === 'medication');

    const analysisPrompt = `You are a veterinary health analyst specializing in pet rats. Analyze the following data and generate health alerts.

**Rats Information:**
${rats.map(rat => `- ${rat.name} (${rat.sex}, born ${rat.birthday})`).join('\n')}

**Recent Activity Summary (Last 30 Days):**
- Total logs: ${logs.length}
- Weight records: ${weightLogs.length}
- Health records: ${healthLogs.length}
- Behavior records: ${behaviorLogs.length}
- Medication records: ${medicationLogs.length}

**Weight Trends:**
${weightLogs.slice(0, 10).map(log => `${new Date(log.created_at).toLocaleDateString()}: ${log.content.weight}g (${rats.find(r => log.rat_ids.includes(r.id))?.name || 'Unknown'})`).join('\n')}

**Health Issues:**
${healthLogs.slice(0, 5).map(log => `${new Date(log.created_at).toLocaleDateString()}: ${log.content.symptoms?.join(', ') || 'General health check'} - ${log.content.notes || 'No notes'}`).join('\n')}

**Behavior Observations:**
${behaviorLogs.slice(0, 5).map(log => `${new Date(log.created_at).toLocaleDateString()}: ${log.content.behavior || 'General behavior'} - ${log.content.notes || 'No notes'}`).join('\n')}

**Medications:**
${medicationLogs.slice(0, 5).map(log => `${new Date(log.created_at).toLocaleDateString()}: ${log.content.medication} (${log.content.dose}) - ${log.content.notes || 'No notes'}`).join('\n')}

**Important Hashtags:**
${logs.flatMap(log => log.content.tags || []).slice(0, 20).join(', ')}

Please analyze this data and return ONLY a valid JSON object with this exact structure:
{
  "alerts": [
    {
      "id": "unique-id",
      "type": "error|warning|info|success",
      "title": "Short alert title",
      "message": "Detailed message",
      "icon": "AlertTriangle|AlertCircle|Info|CheckCircle|TrendingDown",
      "rat_ids": ["rat-uuid"],
      "priority": 1-5,
      "action_needed": true|false
    }
  ],
  "overall_status": "error|warning|info|success",
  "summary": "Brief overall health summary"
}

**Analysis Guidelines:**
- Use "error" for critical issues (rapid weight loss >10%, severe symptoms, missed medications)
- Use "warning" for concerning trends (gradual weight loss, minor symptoms, behavior changes)
- Use "info" for observations (stable trends, general notes)
- Use "success" when everything looks healthy
- Prioritize alerts (1=highest, 5=lowest)
- Include specific rat names in messages
- Set action_needed=true for issues requiring immediate attention
- Keep messages concise but informative

Return ONLY the JSON object, no markdown formatting.`;

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Gemini API for health analysis...');

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: analysisPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    console.log('Gemini response:', generatedText);

    // Parse JSON response
    let analysisResult;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(generatedText);
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      analysisResult = {
        alerts: [{
          id: 'parse-error',
          type: 'warning',
          title: 'Analysis Available',
          message: 'Health data analyzed, but formatting needs review',
          icon: 'AlertCircle',
          priority: 3,
          action_needed: false
        }],
        overall_status: 'info',
        summary: 'Analysis completed with minor issues'
      };
    }

    // Cache the results
    const { error: cacheError } = await supabaseClient
      .from('health_alerts_cache')
      .upsert({
        user_id: user.id,
        analysis_data: analysisResult,
        log_count: logs.length,
        last_log_timestamp: logs[0].created_at,
        updated_at: new Date().toISOString()
      });

    if (cacheError) {
      console.error('Failed to cache results:', cacheError);
    }

    return new Response(JSON.stringify({
      ...analysisResult,
      cached: false,
      api_cost: 'gemini-2.0-flash-exp',
      model_used: 'gemini-2.0-flash-exp'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in health-alerts-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      alerts: [{
        id: 'error',
        type: 'error',
        title: 'Analysis Error',
        message: 'Failed to analyze health data. Please try again later.',
        icon: 'AlertTriangle',
        priority: 1,
        action_needed: false
      }],
      overall_status: 'error',
      summary: 'Error occurred during analysis'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
