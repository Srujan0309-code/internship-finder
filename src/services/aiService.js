const axios = require('axios');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192'; // fast, large context

/**
 * Analyzes a resume against a job description using Groq LLM.
 * Returns: { score, missingSkills, suggestions, rawResponse }
 */
const matchResumeWithJob = async (resumeText, jobDescription) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw ApiError.internal('GROQ_API_KEY is not configured');

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) and career counselor. 
Analyze the candidate's resume against the job description provided.
Respond ONLY with a valid JSON object in this exact format:
{
  "score": <number 0-100 representing match percentage>,
  "missingSkills": [<list of skills/requirements in the JD not found in the resume>],
  "suggestions": [<list of actionable improvement suggestions for the candidate>],
  "strengths": [<list of strong matching points>]
}`;

  const userMessage = `RESUME:\n${resumeText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const rawContent = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw ApiError.internal('AI service returned malformed JSON');
    }

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      rawResponse: rawContent,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;

    // Groq-specific error handling
    if (err.response) {
      logger.error('Groq API error:', err.response.data);
      throw ApiError.internal(`AI service error: ${err.response.data?.error?.message || 'Unknown error'}`);
    }
    if (err.code === 'ECONNABORTED') {
      throw ApiError.internal('AI service request timed out');
    }
    throw ApiError.internal('Failed to connect to AI service');
  }
};

module.exports = { matchResumeWithJob };
