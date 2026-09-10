export const SMRITI_SYSTEM_PROMPT = `You are SMRITI AI, a supportive care-management assistant for dementia and Alzheimer's care. You provide general supportive information and organization assistance. You do not diagnose medical conditions, prescribe treatment, or replace healthcare professionals. When a situation may require medical attention, encourage the caregiver to consult an appropriate healthcare professional.`;

export const MEDICAL_DISCLAIMER = `SMRITI AI provides supportive information and does not diagnose medical conditions or replace professional medical advice.`;

interface AIRequestPayload {
  prompt: string;
  contextType?: 'care_summary' | 'doctor_visit' | 'activity_suggestion' | 'care_concept' | 'general';
  patientName?: string;
  recentObservations?: string[];
  medicationsSummary?: string[];
}

export async function generateSMRITIResponse(payload: AIRequestPayload): Promise<{
  response: string;
  disclaimer: string;
  suggestedFollowups?: string[];
  isDemoFallback: boolean;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SMRITI_SYSTEM_PROMPT}\n\nContext:\nPatient Name: ${payload.patientName || 'Patient'}\nRecent Observations: ${
                      payload.recentObservations?.join('; ') || 'None provided'
                    }\nMedications: ${
                      payload.medicationsSummary?.join('; ') || 'None provided'
                    }\n\nUser Question:\n${payload.prompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            response: text,
            disclaimer: MEDICAL_DISCLAIMER,
            suggestedFollowups: [
              'Summarize doctor visit notes',
              'Suggest a calming afternoon activity',
              'Explain mild cognitive impairment simply',
            ],
            isDemoFallback: false,
          };
        }
      }
    } catch (e) {
      console.error('Gemini API call failed, falling back to SMRITI care generator:', e);
    }
  }

  // Intelligent Contextual Fallback for Caregivers
  const promptLower = payload.prompt.toLowerCase();
  let aiText = '';

  if (promptLower.includes('doctor') || promptLower.includes('visit') || payload.contextType === 'doctor_visit') {
    aiText = `### 📋 Doctor Visit Summary for ${payload.patientName || 'Eleanor Vance'}\n\n` +
      `Here is a structured summary of recent care observations and status for your upcoming appointment:\n\n` +
      `**1. Recent Mood & Behavior Profile:**\n` +
      `- Overall Mood: Calm and generally peaceful during morning hours.\n` +
      `- Notable Patterns: Responds very positively to music and visual photo memories. Mild evening restlessness noted around dusk.\n\n` +
      `**2. Medication Adherence:**\n` +
      `- High adherence rate (~92%) recorded over the past 30 days.\n` +
      `- Morning Donepezil (10mg) and Memantine (10mg) consistently administered.\n\n` +
      `**3. Key Questions to Ask the Doctor:**\n` +
      `- Are there any suggested routine adjustments to ease evening sundowning transitions?\n` +
      `- Should we maintain current dosage timing for morning medications?\n` +
      `- Are physical balance exercises recommended for home routines?\n`;
  } else if (promptLower.includes('summary') || promptLower.includes('today') || payload.contextType === 'care_summary') {
    aiText = `### 🌅 Daily Care Overview for ${payload.patientName || 'Eleanor Vance'}\n\n` +
      `**Today's Status Summary:**\n` +
      `- **Medications:** Morning doses completed successfully. Afternoon dose scheduled.\n` +
      `- **Hydration & Meals:** Morning warm chamomile tea completed. Good appetite reported.\n` +
      `- **Activities:** Courtyard patio walk completed with caregiver support.\n` +
      `- **Cognitive Engagement:** Spent 20 minutes reviewing family memory album (Cape Cod photos).\n\n` +
      `**Caregiver Recommendation:**\n` +
      `Keep the environment peaceful during early evening hours with soft ambient lighting and familiar classical acoustic music.`;
  } else if (promptLower.includes('activity') || promptLower.includes('suggest') || payload.contextType === 'activity_suggestion') {
    aiText = `### 🌸 Recommended Calming Care Activities\n\n` +
      `Here are 3 sensory-friendly, low-stress activities designed to foster belonging and cognitive comfort:\n\n` +
      `1. **"My People" Story Sharing:** Open the SMRITI Memory Album together and gently ask about familiar faces without pressuring dates or exact details.\n` +
      `2. **Tactile Lavender & Garden Experience:** Sit by a sunlit window or garden patio. Engage senses with aromatic lavender or soft floral fabrics.\n` +
      `3. **Rhythmic Music Sing-Along:** Play familiar melodies from past decades (e.g. 1950s/60s classics). Rhythm and melody often remain deeply accessible.`;
  } else {
    aiText = `### 🤝 SMRITI Supportive Care Guidance\n\n` +
      `Thank you for asking about care management for ${payload.patientName || 'your loved one'}.\n\n` +
      `Maintaining a predictable daily routine—including consistent meal times, gentle physical movement, and regular hydration—is one of the most effective ways to support emotional comfort and cognitive stability.\n\n` +
      `**Key Daily Pillars:**\n` +
      `- **Predictability:** Keep daily events in familiar sequence.\n` +
      `- **Validation:** Offer empathetic reassurance rather than correcting minor memory slips.\n` +
      `- **Belonging:** Include your loved one in simple household moments.`;
  }

  return {
    response: aiText,
    disclaimer: MEDICAL_DISCLAIMER,
    suggestedFollowups: [
      "Summarize today's care progress",
      "Prepare doctor-visit summary",
      "Suggest a calming memory activity",
      "Explain daily routine structure",
    ],
    isDemoFallback: true,
  };
}
