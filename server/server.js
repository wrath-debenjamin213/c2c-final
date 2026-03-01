require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Real-time Chat Logic
io.on('connection', (socket) => {
    console.log('⚡ A user connected to WebSocket:', socket.id);

    // Join a specific roadmap room
    socket.on('join_roadmap', (roadmapId) => {
        socket.join(roadmapId);
        console.log(`User ${socket.id} joined roadmap room: ${roadmapId}`);
    });

    // Handle incoming chat messages
    socket.on('send_message', (data) => {
        // data expects: { roadmapId, senderName, text, timestamp }
        console.log("Chat Message Received:", data);

        // Broadcast to everyone else in the exact same roadmap room
        socket.to(data.roadmapId).emit('receive_message', data);
    });

    // Handle live roadmap state synchronization
    socket.on('update_roadmap', (data) => {
        // Broadcast the updated roadmap JSON to everyone else in the room
        socket.to(data.roadmapId).emit('roadmap_updated', data.roadmap);

        // Save state persistently for late-joiners hitting the link later
        for (const [sId, r] of sharedRoadmaps.entries()) {
            if (r.id === data.roadmapId) {
                sharedRoadmaps.set(sId, data.roadmap);
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Load API Key securely from the backend environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is not defined in the server/.env file. AI routes will fail.");
}

app.post('/api/generate-roadmap', async (req, res) => {
    try {
        const { formData } = req.body;

        if (!formData || !formData.idea) {
            return res.status(400).json({ error: "Missing required formData payload." });
        }

        const { idea, timeline, category, budget, teamSize, creatorName, scope } = formData;
        const sizeInt = parseInt(teamSize) || 1;

        const systemPrompt = `
        You are an expert CTO and Product Manager. Your job is to take a raw user idea and build a highly structured, realistic Execution Roadmap.
        
        The user's idea revolves around: "${idea}"
        The category is: "${category}"
        The requested timeline is: "${timeline} weeks"
        The exact Team Size available is: ${sizeInt} people.
        The project creator's name is: "${creatorName}".
        The scope complexity is: ${scope}
        The budget is: ${budget ? '$' + budget : 'Unknown/N/A'}
        
        Output a strictly valid JSON object matching the exact schema required by our frontend. The JSON must contain a single root array named "phases". Do NOT wrap the JSON in markdown codeblocks (no \`\`\`json). Just return the raw JSON text.
        
        Schema instructions:
        1. Distribute the work into logical sequential "phases" (e.g., "Phase 1: Discovery", "Phase 2: Execution"). The number of phases is up to you, but should make sense for a ${timeline} week timeline.
        2. Each phase must have a "title" string and a "tasks" array.
        3. Each task must have the following properties:
            - "id": A unique string (e.g., "t1", "t2").
            - "title": A concise action-oriented string.
            - "estimatedHours": An integer representing hours of effort.
            - "completed": false (boolean).
            - "assignee": A string. Assign tasks either to the creator ("${creatorName}") or to a generic role like "Unassigned", "Designer", "Developer", "Marketer" based on the task type. Make sure to distribute tasks logically for a team of ${sizeInt}.
            - "cost": A string estimating the cost (e.g., "$0", "$50/mo"). Keep it within the total budget of ${budget || '0'}.
            - "prereqs": A string identifying a previous task id that must be done first, or "None".
            - "details": An object with exactly 6 properties:
                - "whatThisMeans": String explaining the task simply.
                - "whatThisMeansExample": Array of strings with concrete examples.
                - "whyItMatters": Array of strings explaining the value.
                - "whatYouNeedToDo": Array of actionable steps.
                - "output": String describing the final deliverable.
                - "outputExample": String showing a tangible example of the output.
                
                
        Make the tasks highly specific to the idea "${idea}". Avoid generic fluff. Be realistic about what a team of ${sizeInt} can achieve in ${timeline} weeks.
        `;

        // Direct fetch to Gemini API from the secure backend
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Defensively parse
        let responseText = data.candidates[0].content.parts[0].text.trim();
        if (responseText.startsWith('\`\`\`json')) responseText = responseText.substring(7);
        else if (responseText.startsWith('\`\`\`')) responseText = responseText.substring(3);
        if (responseText.endsWith('\`\`\`')) responseText = responseText.substring(0, responseText.length - 3);

        const generatedRoadmap = JSON.parse(responseText.trim());

        res.json({ roadmap: generatedRoadmap });

    } catch (error) {
        console.error("Backend AI Generation Failed:", error);
        res.status(500).json({ error: "Failed to generate AI roadmap", details: error.message });
    }
});

// --- Multi-User Shared Roadmaps ---

// In-memory store for shared roadmaps. In production, this would be Redis or a Database.
const sharedRoadmaps = new Map();

app.post('/api/share', (req, res) => {
    try {
        const { roadmap } = req.body;
        if (!roadmap || !roadmap.id) {
            return res.status(400).json({ error: "Invalid roadmap payload." });
        }

        // Generate a simple unique share ID
        const shareId = Math.random().toString(36).substring(2, 8).toUpperCase();

        sharedRoadmaps.set(shareId, roadmap);
        console.log(`📡 Created shared roadmap link: ${shareId} for idea: ${roadmap.ideaName}`);

        res.json({ shareId });
    } catch (error) {
        console.error("Share Link Generation Failed:", error);
        res.status(500).json({ error: "Failed to generate share link" });
    }
});

app.get('/api/shared-roadmap/:id', (req, res) => {
    const { id } = req.params;

    if (sharedRoadmaps.has(id)) {
        res.json({ roadmap: sharedRoadmaps.get(id) });
    } else {
        res.status(404).json({ error: "Shared roadmap not found or expired." });
    }
});

app.post('/api/shared-roadmap/:id/join', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing user name" });
    }

    if (sharedRoadmaps.has(id)) {
        const roadmap = sharedRoadmaps.get(id);

        // Ensure teamMembers exists and is an array
        if (!roadmap.teamMembers) roadmap.teamMembers = [];

        if (!roadmap.teamMembers.includes(name)) {
            roadmap.teamMembers.push(name);
            console.log(`👤 User ${name} joined shared roadmap ${id}`);

            // Broadcast the updated roadmap so the creator's dashboard updates in real-time
            io.to(roadmap.id).emit('roadmap_updated', roadmap);
        }
        res.json({ teamMembers: roadmap.teamMembers });
    } else {
        res.status(404).json({ error: "Shared roadmap not found or expired." });
    }
});

server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
