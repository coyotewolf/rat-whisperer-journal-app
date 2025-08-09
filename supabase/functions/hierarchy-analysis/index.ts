import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { timeRange = 30 } = await req.json();
    
    console.log(`Starting hierarchy analysis for user ${user.id} with timeRange ${timeRange}`);
    
    // Check cache validity
    const cacheValidation = await checkCacheValidity(supabase, user.id, timeRange);
    
    if (cacheValidation.isValid && cacheValidation.cache) {
      console.log('Returning cached analysis');
      return new Response(JSON.stringify({
        success: true,
        data: cacheValidation.cache,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get behavior logs for analysis
    const dateRange = getDateRange(timeRange);
    const { data: behaviorLogs, error: logsError } = await supabase
      .from('log_entries')
      .select(`
        id,
        content,
        created_at,
        rat_ids
      `)
      .eq('user_id', user.id)
      .eq('type', 'behavior')
      .gte('created_at', dateRange)
      .order('created_at', { ascending: false });

    if (logsError) {
      throw new Error(`Failed to fetch behavior logs: ${logsError.message}`);
    }

    // Get rat information
    const { data: rats, error: ratsError } = await supabase
      .from('rats')
      .select('id, name')
      .eq('user_id', user.id);

    if (ratsError) {
      throw new Error(`Failed to fetch rats: ${ratsError.message}`);
    }

    if (!behaviorLogs || behaviorLogs.length === 0) {
      const emptyAnalysis = {
        analysis_summary: "目前沒有足夠的行為資料進行分析",
        rats_hierarchy: rats?.map((rat, index) => ({
          rat_name: rat.name,
          rat_id: rat.id,
          dominance_score: 0,
          rank: index + 1,
          dominant_behaviors: [],
          submissive_behaviors: [],
          analysis: "需要更多行為觀察資料"
        })) || [],
        interaction_patterns: "無互動資料",
        recommendations: "建議記錄更多行為觀察"
      };

      await updateAnalysisCache(supabase, user.id, timeRange, emptyAnalysis, {
        count: 0,
        latest_time: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        data: emptyAnalysis,
        cached: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for Gemini analysis
    const behaviorData = prepareBehaviorDataForAnalysis(behaviorLogs, rats || []);
    
    // Call Gemini API for analysis
    const analysisResult = await callGeminiForHierarchyAnalysis(behaviorData);
    
    // Update cache
    await updateAnalysisCache(supabase, user.id, timeRange, analysisResult, cacheValidation.currentStats);

    // Persist per-rat rank snapshot for long-term trend
    try {
      const nowIso = new Date().toISOString();
      const rows = (analysisResult?.rats_hierarchy || []).map((r: any) => ({
        user_id: user.id,
        analysis_time: nowIso,
        rat_id: r.rat_id,
        rat_name: r.rat_name,
        rank: r.rank,
        dominance_score: r.dominance_score,
        time_range: timeRange,
      }));
      if (rows.length > 0) {
        const { error: histErr } = await supabase.from('rat_rank_history').insert(rows);
        if (histErr) console.error('Failed to insert rank history:', histErr.message);
      }
    } catch (e) {
      console.error('Error while saving rank history:', e);
    }
    
    console.log('Analysis completed and cached');
    
    return new Response(JSON.stringify({
      success: true,
      data: analysisResult,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hierarchy-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkCacheValidity(supabase: any, userId: string, timeRange: number) {
  // Get existing cache
  const { data: cache } = await supabase
    .from('hierarchy_analysis_cache')
    .select('*')
    .eq('user_id', userId)
    .eq('time_range', timeRange)
    .single();

  if (!cache) return { isValid: false, currentStats: await getCurrentBehaviorStats(supabase, userId, timeRange) };

  // Get current behavior stats
  const currentStats = await getCurrentBehaviorStats(supabase, userId, timeRange);
  
  // Compare cache validity
  const isCountChanged = currentStats.count !== cache.behavior_log_count;
  const isTimeChanged = currentStats.latest_time && 
    new Date(currentStats.latest_time) > new Date(cache.last_behavior_log_timestamp);

  return {
    isValid: !isCountChanged && !isTimeChanged,
    cache: cache.analysis_data,
    currentStats
  };
}

async function getCurrentBehaviorStats(supabase: any, userId: string, timeRange: number) {
  const dateRange = getDateRange(timeRange);
  
  const { data: latestLog } = await supabase
    .from('log_entries')
    .select('created_at')
    .eq('user_id', userId)
    .eq('type', 'behavior')
    .gte('created_at', dateRange)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  const { count } = await supabase
    .from('log_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'behavior')
    .gte('created_at', dateRange);

  return {
    count: count || 0,
    latest_time: latestLog?.created_at || null
  };
}

function getDateRange(timeRange: number): string {
  const date = new Date();
  date.setDate(date.getDate() - timeRange);
  return date.toISOString();
}

function prepareBehaviorDataForAnalysis(behaviorLogs: any[], rats: any[]) {
  const ratMap = new Map(rats.map(rat => [rat.id, rat.name]));
  
  return behaviorLogs.map(log => {
    const ratNames = log.rat_ids?.map((id: string) => ratMap.get(id) || '未知鼠名') || [];
    return {
      date: log.created_at,
      rats: ratNames,
      behaviors: log.content?.tags || [],
      notes: log.content?.notes || '',
      behavior: log.content?.behavior || ''
    };
  });
}

async function callGeminiForHierarchyAnalysis(behaviorData: any[]) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `
請以可愛貼心的語氣分析以下鼠類行為數據，基於動物行為學原理計算每隻鼠的社會地位：

行為資料：
${JSON.stringify(behaviorData, null, 2)}

請返回 JSON 格式：
{
  "analysis_summary": "整體分析摘要（可愛貼心語氣）",
  "rats_hierarchy": [
    {
      "rat_name": "鼠名",
      "rat_id": "鼠ID", 
      "dominance_score": 數值(-100到100),
      "rank": 排名(1,2,3...),
      "dominant_behaviors": ["支配性行為列表"],
      "submissive_behaviors": ["服從性行為列表"],
      "analysis": "個別分析說明（可愛貼心語氣）",
      "nickname": "根據行為特徵取的可愛暱稱，並在末尾附上最貼切的 emoji（例如：'和平使者🕊️'、'暴躁將軍😠'、'邊緣探險家🧭'）"
    }
  ],
  "interaction_patterns": "互動模式分析（可愛貼心語氣）",
  "recommendations": "建議事項（可愛貼心語氣，只在發現異常行為或社會關係問題時提供，用條列方式呈現）",
  "api_cost": "估算費用（美金）",
  "model_used": "gemini-2.0-flash-exp"
}

分析重點：
1. 支配性行為：追逐、壓制、搶奪資源、占據高地、威脅姿態
2. 服從性行為：躲避、逃跑、讓出資源、服從姿態、尋求安慰
3. 考慮行為頻率、強度和背景情況
4. 提供實用的飼養建議
5. 支配分數範圍：-100(極度服從)到+100(極度支配)，0為中性
6. 使用可愛、溫柔、貼心的語氣，像是在和鼠奴聊天
7. 避免過於學術性的語言，多用親切的詞彙
`;

  const startTime = Date.now();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  const endTime = Date.now();
  
  // 計算估算費用（根據 Gemini 定價）
  const inputTokens = prompt.length / 4; // 粗略估算
  const outputTokens = generatedText?.length / 4 || 0;
  const estimatedCost = calculateGeminiCost(inputTokens, outputTokens);
  
  console.log(`Gemini API call completed in ${endTime - startTime}ms`);
  console.log(`Estimated cost: $${estimatedCost}`);
  console.log(`Input tokens: ~${inputTokens}, Output tokens: ~${outputTokens}`);
  
  if (!generatedText) {
    throw new Error('No response from Gemini API');
  }

  try {
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    
    // 添加實際費用信息
    parsedResult.api_cost = `$${estimatedCost}`;
    parsedResult.model_used = 'gemini-2.0-flash-exp';
    
    return parsedResult;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', generatedText);
    throw new Error('Failed to parse Gemini analysis result');
  }
}

function calculateGeminiCost(inputTokens: number, outputTokens: number): string {
  // Gemini 2.0 Flash 定價（每1M tokens）
  const inputCostPer1M = 0.075; // $0.075 per 1M input tokens
  const outputCostPer1M = 0.30;  // $0.30 per 1M output tokens
  
  const inputCost = (inputTokens / 1000000) * inputCostPer1M;
  const outputCost = (outputTokens / 1000000) * outputCostPer1M;
  const totalCost = inputCost + outputCost;
  
  return totalCost.toFixed(6);
}

async function updateAnalysisCache(supabase: any, userId: string, timeRange: number, analysisResult: any, behaviorStats: any) {
  await supabase
    .from('hierarchy_analysis_cache')
    .upsert({
      user_id: userId,
      time_range: timeRange,
      analysis_data: analysisResult,
      last_behavior_log_timestamp: behaviorStats.latest_time || new Date().toISOString(),
      behavior_log_count: behaviorStats.count || 0,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,time_range'
    });
}