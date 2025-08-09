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

    const { action, surveyId, answers } = await req.json();
    
    if (action === 'generate') {
      // Generate daily survey questions
      const questions = await generateDailyQuestions(supabase, user.id);
      
      // Create or update today's survey
      const today = new Date().toISOString().split('T')[0];
      const { data: survey, error: surveyError } = await supabase
        .from('daily_interaction_surveys')
        .upsert({
          user_id: user.id,
          survey_date: today,
          questions: questions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,survey_date'
        })
        .select()
        .single();

      if (surveyError) {
        throw new Error(`Failed to create survey: ${surveyError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          surveyId: survey.id,
          questions: questions,
          surveyDate: today,
          api_cost_estimate: geminiApiKey ? 0.00018 : 0,
          model_used: geminiApiKey ? 'gemini-2.0-flash-exp' : 'fallback'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'submit') {
      // Submit survey answers
      if (!surveyId || !answers) {
        throw new Error('Survey ID and answers are required');
      }

      // Process answers into behavior data
      const processedBehaviors = await processAnswersToBehaviors(answers);

      // Update survey with answers
      const { error: updateError } = await supabase
        .from('daily_interaction_surveys')
        .update({
          answers: answers,
          processed_behaviors: processedBehaviors,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', surveyId)
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Failed to submit survey: ${updateError.message}`);
      }

      // Convert processed behaviors to log entries
      if (processedBehaviors && processedBehaviors.length > 0) {
        await createBehaviorLogs(supabase, user.id, processedBehaviors);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Survey submitted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'check') {
      // Check if survey exists for today
      const today = new Date().toISOString().split('T')[0];
      const { data: survey } = await supabase
        .from('daily_interaction_surveys')
        .select('*')
        .eq('user_id', user.id)
        .eq('survey_date', today)
        .single();

      return new Response(JSON.stringify({
        success: true,
        data: {
          exists: !!survey,
          completed: !!survey?.completed_at,
          survey: survey
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in daily-interaction-survey function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDailyQuestions(supabase: any, userId: string) {
  // Analyze recent behavior logs to identify data gaps
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 14);

  const { data: recentLogs } = await supabase
    .from('log_entries')
    .select('content, created_at, type')
    .eq('user_id', userId)
    .eq('type', 'behavior')
    .gte('created_at', fromDate.toISOString());

  const categoryCounts: Record<string, number> = { feeding: 0, play: 0, territory: 0, interaction: 0 };

  (recentLogs || []).forEach((entry: any) => {
    const behaviorTag = entry?.content?.behavior as string | undefined;
    if (!behaviorTag) return;
    if (behaviorTag.includes('resource')) categoryCounts.feeding++;
    else if (behaviorTag.includes('play')) categoryCounts.play++;
    else if (behaviorTag.includes('territory')) categoryCounts.territory++;
    else if (behaviorTag.includes('interaction')) categoryCounts.interaction++;
  });

  const leastObserved = Object.entries(categoryCounts)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k)
    .slice(0, 2);

  if (!geminiApiKey) {
    // Fallback questions tailored to least observed categories
    const fallbackCategories = ['feeding', 'play', 'territory', 'interaction'];
    const ordered = [...leastObserved, ...fallbackCategories].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);

    // Get user's rats
    const { data: rats } = await supabase
      .from('rats')
      .select('id, name')
      .eq('user_id', userId)
      .eq('status', 'active');

    const ratNames = (rats || []).map((r: any) => r.name);

    return ordered.map((cat, idx) => (
      cat === 'interaction'
        ? { id: idx + 1, type: 'text', question: '今天有觀察到任何特殊的互動行為嗎？', category: 'interaction' }
        : {
            id: idx + 1,
            type: 'multiple_choice',
            question: cat === 'feeding' ? '今天誰通常第一個接近食物？' : cat === 'play' ? '在玩耍時，誰比較主動？' : '誰通常占據最高的位置？',
            options: [...ratNames, '沒有觀察到'],
            category: cat,
          }
    ));
  }

  // Get user's rats
  const { data: rats } = await supabase
    .from('rats')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!rats || rats.length === 0) {
    return [];
  }

  const ratNames = rats.map((rat: any) => rat.name);

  const gapsText = Object.entries(categoryCounts)
    .map(([k, v]) => `${k}:${v}`)
    .join(', ');

  const prompt = `
請根據以下「數據缺口」優先生成 4-5 個日常觀察問題，聚焦補齊缺乏的面向：
- 近14日各面向紀錄次數：${gapsText}
- 請優先關注最少的面向（例如：${leastObserved.join(', ')}）
- 鼠群成員：${ratNames.join(', ')}

規則：
1. 同時包含多選題與開放題
2. 多選題選項包含所有鼠名與「沒有觀察到」
3. 問題需簡潔、日常可觀察
4. 返回 JSON 格式 { "questions": [...] }，包含 id、type、question、options(如為多選)、category(feeding/play/territory/interaction)
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error('No response from Gemini API');
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult.questions || [];
  } catch (error) {
    console.error('Failed to generate questions with Gemini:', error);
    // Fallback to simple tailored questions
    const fallbackCategories = ['feeding', 'play', 'territory', 'interaction'];
    const ordered = [...leastObserved, ...fallbackCategories].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);

    const ratNames = (rats || []).map((r: any) => r.name);

    return ordered.map((cat, idx) => (
      cat === 'interaction'
        ? { id: idx + 1, type: 'text', question: '今天有觀察到任何特殊的互動行為嗎？', category: 'interaction' }
        : {
            id: idx + 1,
            type: 'multiple_choice',
            question: cat === 'feeding' ? '今天誰通常第一個接近食物？' : cat === 'play' ? '在玩耍時，誰比較主動？' : '誰通常占據最高的位置？',
            options: [...ratNames, '沒有觀察到'],
            category: cat,
          }
    ));
  }
}

async function processAnswersToBehaviors(answers: any[]) {
  const behaviors = [];
  
  for (const answer of answers) {
    if (answer.type === 'multiple_choice') {
      const behaviorTag = getBehaviorTagFromCategory(answer.category);
      if (behaviorTag) {
        // 處理多選選項 - 保持組合記錄
        if (answer.selectedOptions && answer.selectedOptions.length > 0) {
          const validOptions = answer.selectedOptions.filter((option: string) => option !== '沒有觀察到');
          if (validOptions.length > 0) {
            // 分離主動和被動行為
            const activeOptions = validOptions.filter((opt: string) => opt.includes('(主動)'));
            const passiveOptions = validOptions.filter((opt: string) => opt.includes('(被動)'));
            const neutralOptions = validOptions.filter((opt: string) => !opt.includes('(主動)') && !opt.includes('(被動)'));
            
            // 記錄主動行為
            if (activeOptions.length > 0) {
              behaviors.push({
                rat_names: activeOptions.map((opt: string) => opt.replace('(主動)', '')),
                behavior_tag: behaviorTag + '_active',
                category: answer.category,
                behavior_type: 'active',
                context: `來自每日調查問題：${answer.question} - 主動行為`
              });
            }
            
            // 記錄被動行為
            if (passiveOptions.length > 0) {
              behaviors.push({
                rat_names: passiveOptions.map((opt: string) => opt.replace('(被動)', '')),
                behavior_tag: behaviorTag + '_passive',
                category: answer.category,
                behavior_type: 'passive',
                context: `來自每日調查問題：${answer.question} - 被動行為`
              });
            }
            
            // 記錄中性行為
            if (neutralOptions.length > 0) {
              behaviors.push({
                rat_names: neutralOptions,
                behavior_tag: behaviorTag,
                category: answer.category,
                behavior_type: 'neutral',
                context: `來自每日調查問題：${answer.question}`
              });
            }
          }
        }
        
        // 處理手動輸入
        if (answer.customInput && answer.customInput.trim()) {
          behaviors.push({
            rat_names: [answer.customInput.trim()],
            behavior_tag: behaviorTag,
            category: answer.category,
            behavior_type: 'neutral',
            context: `來自每日調查問題：${answer.question}（手動輸入）`
          });
        }
      }
    } else if (answer.type === 'text' && answer.textAnswer && answer.textAnswer.trim()) {
      behaviors.push({
        behavior_tag: 'general_interaction',
        category: 'interaction',
        notes: answer.textAnswer,
        context: `來自每日調查問題：${answer.question}`
      });
    }
  }
  
  return behaviors;
}

function getBehaviorTagFromCategory(category: string): string | null {
  const categoryMap: { [key: string]: string } = {
    'feeding': 'resource_dominance',
    'play': 'social_play',
    'territory': 'territory_claiming',
    'interaction': 'social_interaction'
  };
  
  return categoryMap[category] || null;
}

async function createBehaviorLogs(supabase: any, userId: string, processedBehaviors: any[]) {
  const { data: rats } = await supabase
    .from('rats')
    .select('id, name')
    .eq('user_id', userId);

  const ratMap = new Map(rats?.map((rat: any) => [rat.name, rat.id]) || []);

  for (const behavior of processedBehaviors) {
    // 支持多選鼠類記錄
    let ratIds = [];
    if (behavior.rat_names && Array.isArray(behavior.rat_names)) {
      ratIds = behavior.rat_names.map((name: string) => ratMap.get(name)).filter(Boolean);
    } else if (behavior.rat_name) {
      const ratId = ratMap.get(behavior.rat_name);
      if (ratId) ratIds = [ratId];
    }
    
    const logContent = {
      behavior: behavior.behavior_tag,
      notes: behavior.notes || behavior.context,
      tags: [behavior.behavior_tag],
      behavior_type: behavior.behavior_type || 'neutral'
    };

    await supabase
      .from('log_entries')
      .insert({
        user_id: userId,
        type: 'behavior',
        rat_ids: ratIds, // 保持多選格式
        content: logContent,
        created_at: new Date().toISOString()
      });
  }
}