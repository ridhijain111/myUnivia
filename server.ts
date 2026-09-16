import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { router as backendRouter } from './src/server/backendRoutes';
import studentRoutes from './src/server/routes/studentRoutes';
import societySystemRoutes from './src/server/routes/societySystemRoutes';
import { connectToDatabase, isDbConnected } from './src/server/database/db';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount Student Profiles CRUD API (MongoDB)
app.use('/api/students', studentRoutes);

// Mount Generic College Society System & Announcement Routes (MongoDB + AI)
app.use('/api', societySystemRoutes);

// Mount Auth, Event Routing & Admin Approval API routes
app.use('/api', backendRouter);

// Database connection status check
app.get('/api/database/status', (req, res) => {
  const connected = isDbConnected();
  res.json({
    success: true,
    connected,
    type: 'MongoDB',
    status: connected ? 'connected' : 'disconnected',
    message: connected
      ? 'Connected to MongoDB cluster.'
      : 'MongoDB URI not detected or connecting. Using resilient fallback in-memory store.',
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected() ? 'connected' : 'offline_fallback',
    timestamp: new Date().toISOString(),
  });
});

const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

async function generateGeminiContentWithFallback(ai: GoogleGenAI, requestPayload: any) {
  let lastError: any = null;
  // Try candidate models with a short retry for transient 503 high-demand spikes
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const model of CANDIDATE_GEMINI_MODELS) {
      try {
        const res = await ai.models.generateContent({
          ...requestPayload,
          model,
        });
        return { response: res, usedModel: model };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Router] Model ${model} (attempt ${attempt + 1}) unavailable (${err?.status || err?.message || 'error'}).`);
      }
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  throw lastError;
}

// Stream Parser API Endpoint
app.post('/api/stream-parser', async (req, res) => {
  try {
    const { streamText, schedule } = req.body;

    if (!streamText || typeof streamText !== 'string') {
      res.status(400).json({ error: 'streamText is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      // Return flag indicating fallback or instructions
      res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY set. Falling back to local engine.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const studentScheduleContext = schedule && Array.isArray(schedule)
      ? JSON.stringify(schedule.map((s: any) => ({
          title: s.title,
          time: s.time,
          location: s.location,
          date: s.date || 'Today',
        })))
      : '[]';

    const systemInstruction = `You are the core AI intelligence engine for "Univia," an advanced campus community platform designed to eliminate information overload for college freshers.

Your goal is to parse chaotic, scattered student announcement streams (from WhatsApp, emails, and discord) and restructure them into clear JSON format matching Univia's modular dashboard.

STRICT CLASSIFICATION LOGIC:
1. EVENTS TAB DATA: Extract structured dates, times, titles, society/club/host, location, category (one of: 'Social', 'Tech & Innovation', 'Arts & Culture', 'Academic & Career', 'Wellness & Sports'), and a concise description for campus workshops or social gatherings.
2. OPPORTUNITIES TAB DATA: Isolate scholarships, career paths, hidden society registrations, project grants, internships, or free perks (with title, organization, type, deadline, compensation, description).
3. CALENDAR CONFLICT DETECTION: Identify if any extracted events overlap or collide with the student's existing schedule provided in context: ${studentScheduleContext}. Detail detected conflict, extracted event, conflicting item, time slot, and recommendation.
4. HONESTY PROTOCOL: If any message lacks vital information (e.g., missing a room number, missing venue confirmation, or missing deadline time), set "incomplete_info": true and detail the missing field in "missing_fields". Do NOT make up placeholders.

OUTPUT: Return only clean, valid JSON matching the exact schema.`;

    const { response } = await generateGeminiContentWithFallback(ai, {
      contents: `Raw Announcement Stream to Parse:\n"""\n${streamText}\n"""`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events_tab_data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  society: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING },
                  location: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'society', 'date', 'time', 'location', 'category', 'description'],
              },
            },
            opportunities_tab_data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  type: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  compensation: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'organization', 'type', 'deadline', 'compensation', 'description'],
              },
            },
            calendar_conflicts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  detected: { type: Type.BOOLEAN },
                  extracted_event: { type: Type.STRING },
                  conflicts_with: { type: Type.STRING },
                  time_slot: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ['detected', 'extracted_event', 'conflicts_with', 'time_slot', 'recommendation'],
              },
            },
            honesty_protocol: {
              type: Type.OBJECT,
              properties: {
                incomplete_info: { type: Type.BOOLEAN },
                missing_fields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                notes: { type: Type.STRING },
              },
              required: ['incomplete_info', 'missing_fields', 'notes'],
            },
          },
          required: ['events_tab_data', 'opportunities_tab_data', 'calendar_conflicts', 'honesty_protocol'],
        },
      },
    });

    let rawText = (response.text || '').trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsedJson = JSON.parse(rawText || '{}');
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error('Gemini Stream Parser error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to parse stream with Gemini',
      fallback: true,
    });
  }
});

// Campus Intelligence Fallback Generator for AI Nova
function generateCampusAssistantReply(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('society') || q.includes('club') || q.includes('assetmerkle') || q.includes('tedx') || q.includes('wics')) {
    return `### 🏛️ University Societies & Student Communities

Here is the breakdown of premier campus societies and clubs you can explore on Univia:

- **AssetMerkle IGDTUW**: Premier technical society specializing in **Web3, AI, Blockchain, and Full-Stack Development**. They host annual hackathons, technical bootcamps, and developer workshops.
- **TEDx IGDTUW**: Focuses on public speaking, stage management, curator curation, event production, and creative writing.
- **WiCS (Women in Computer Science)**: Mentorship network for competitive programming, open source, and FAANG/tier-1 tech recruitment.
- **TechNeeds**: Focuses on assistive technology, social impact projects, and IoT prototypes for accessibility.
- **Hypnotics & Tarannum**: Dance and music societies conducting cultural fest auditions and inter-college competitions.

💡 *Tip:* Check out the **Societies** tab on Univia to view upcoming orientations and join society discussion groups directly!`;
  }

  if (q.includes('exam') || q.includes('syllabus') || q.includes('bas-103') || q.includes('study') || q.includes('subject') || q.includes('attendance') || q.includes('marks')) {
    return `### 📚 Academic Strategy & Exam Preparation

Here is essential guidance for your university coursework:

1. **BAS-103 Probability & Statistics / Mathematics**:
   - Focus on Probability distributions (Binomial, Poisson, Normal), Bayes Theorem, and Hypothesis Testing.
   - Practice numerical problems from standard textbook references (*Erwin Kreyszig* or *S.C. Gupta*).
2. **Attendance Policy**:
   - The university mandates a minimum **75% attendance** to sit for end-term examinations. Univia's **Schedule & Calendar** view tracks your classes and helps avoid attendance shortages.
3. **Mid-Terms vs End-Terms**:
   - **Internal Assessments (30-40%)**: Class tests, laboratory viva, assignments, and attendance score.
   - **End-Term Exams (60-70%)**: Comprehensive theory paper covering all modules.
   - Prioritize past 3-5 years previous question papers (PYQs) available from senior drives and departmental libraries.`;
  }

  if (q.includes('timetable') || q.includes('schedule') || q.includes('class') || q.includes('room') || q.includes('slot')) {
    return `### 🗓️ Timetable & Campus Schedule Management

Univia provides two synchronized ways to manage your university schedule:

1. **Official Time-Table Grid**:
   - Access the **Calendar** tab and select **Official Time-Table Grid**.
   - You can view slot-by-slot class matrices, filter by subjects, and click **Upload Photo** to upload or update a photo of your classroom notice board.
2. **Real-Time Campus Clock**:
   - Univia always displays the **real, live campus date and time** so you know exactly which lecture is currently in session.
3. **Personal Deadlines**:
   - Add your upcoming assignment submission dates and project vivas to receive automatic reminders.`;
  }

  if (q.includes('opportunity') || q.includes('internship') || q.includes('hackathon') || q.includes('gsoc') || q.includes('scholarship')) {
    return `### 🚀 Tech Opportunities, Hackathons & Internships

Explore curated fresher opportunities to build your portfolio:

- **Open Source Programs**:
  - *Google Summer of Code (GSoC)*, *Outreachy*, and *LFX Mentorship* open applications in spring and autumn.
  - Start contributing to beginner-friendly GitHub repositories using \`good first issue\` tags.
- **Hackathons**:
  - Look out for *Smart India Hackathon (SIH)*, *ETHIndia*, and college annual hackathons.
  - Team up with peers through Univia's **Messages & Groups** feature!
- **Scholarships**:
  - Check the **Opportunities** tab on Univia for corporate and merit-cum-means scholarships.`;
  }

  if (q.includes('event') || q.includes('fest') || q.includes('workshop')) {
    return `### 🎪 Campus Events & Technical Workshops

Here is how to stay ahead of campus events:

- Visit the **Events** tab to browse workshops, guest lectures, and cultural fests.
- Click **RSVP** on any event to save it directly into your personal Univia schedule.
- Use the **Stream Parser** (sparkle icon in the top header) to paste announcements from WhatsApp or email to extract event dates, venues, and registration links automatically!`;
  }

  return `### 💡 AI Nova Campus Intelligence

Hello! I am **AI Nova**, your Univia campus companion. Here are a few ways I can assist you:

- **Course Advice**: Syllabus breakdown, exam preparation, and study resources for B.Tech subjects.
- **Societies & Clubs**: Finding tech societies (AssetMerkle, WiCS, TEDx) and audition details.
- **Time-Table & Routine**: Class scheduling, lab room locations, and timetable image uploads.
- **Campus Life**: Attendance requirements (75% rule), canteens, hostels, and sports facilities.
- **Hackathons & Careers**: Finding internships, open source programs, and project partners.

Feel free to ask a specific question, like *"How do I prepare for BAS-103?"* or *"Tell me about AssetMerkle society!"*`;
}

// AI Nova Intelligent Campus Assistant Endpoint (Powered by Gemini)
app.post('/api/nova', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const trimmedMessage = message.trim();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      // Return high-quality domain campus response immediately if no API key is provided
      const fallbackReply = generateCampusAssistantReply(trimmedMessage);
      res.json({ success: true, reply: fallbackReply });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are AI Nova, the intelligent, warm, and highly knowledgeable campus AI assistant for "Univia" college community platform.
Your mission is to help college freshers, engineering students, and campus community members thrive academically and socially without information overload.

Core Capabilities:
1. Academic Advice: Core B.Tech courses (Data Structures, Python, BAS-103 Probability & Statistics, Basics of Electrical Engineering, Digital Electronics, Applied Physics).
2. Campus Societies: AssetMerkle (Web3 & AI), TEDx (Stagecraft & Thought Leadership), TechNeeds (Assistive Tech Innovation), WiCS (Women in Computer Science), Product & Design Guild, etc.
3. College Life & Freshers: Class navigation, internal practicals vs end-terms, attendance strategy (75% rule), timetable planning, finding project teammates.
4. Opportunities & Careers: Hackathon recommendations, open-source programs (GSoC, Outreachy), internship applications, scholarships.

Tone & Formatting:
- Friendly, empowering, collegiate, and concise.
- Use clean Markdown with bold keywords and bullet points for effortless readability.
- Mention Univia's features (Time-Table Grid, Events RSVP, Stream Parser, Messages) when relevant.`;

      // Gemini API requirement:
      // 1. Conversation MUST start with 'user' role
      // 2. Roles MUST alternate strictly: user -> model -> user -> model
      // 3. Final turn MUST be the user message
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(conversation) && conversation.length > 0) {
        // Collect valid previous non-empty turns
        const validTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
        for (const turn of conversation) {
          if (!turn || typeof turn.content !== 'string') continue;
          const text = turn.content.trim();
          if (!text) continue;
          validTurns.push({
            role: turn.role === 'user' ? 'user' : 'model',
            text,
          });
        }

        // Must begin with 'user'
        const firstUserIdx = validTurns.findIndex((t) => t.role === 'user');
        if (firstUserIdx !== -1) {
          let expectedRole: 'user' | 'model' = 'user';
          for (let i = firstUserIdx; i < validTurns.length; i++) {
            const turn = validTurns[i];
            if (turn.role === expectedRole) {
              contents.push({
                role: turn.role,
                parts: [{ text: turn.text }],
              });
              expectedRole = expectedRole === 'user' ? 'model' : 'user';
            }
          }
        }
      }

      // If the last historical turn was 'user', drop it so the final turn is the current user message
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop();
      }

      // Append current user message as the final turn
      contents.push({
        role: 'user',
        parts: [{ text: trimmedMessage }],
      });

      console.log(`[AI Nova] Sending request to Gemini with ${contents.length} turns...`);
      const { response, usedModel } = await generateGeminiContentWithFallback(ai, {
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || generateCampusAssistantReply(trimmedMessage);
      console.log(`[AI Nova] Gemini responded successfully using model ${usedModel}`);
      res.json({ success: true, reply, model: usedModel });
    } catch (geminiError: any) {
      console.warn('Gemini API call failed, using intelligent campus fallback:', geminiError?.message || geminiError);
      const fallbackReply = generateCampusAssistantReply(trimmedMessage);
      res.json({ success: true, reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('AI Nova endpoint error:', error);
    const fallbackReply = generateCampusAssistantReply(req.body?.message || '');
    res.json({
      success: true,
      reply: fallbackReply,
    });
  }
});

async function startServer() {
  // Connect to MongoDB
  try {
    await connectToDatabase();
  } catch (err: any) {
    console.warn('[Server Startup] MongoDB connection attempt finished with message:', err?.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
