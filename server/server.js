require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;


// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());


// =========================
// Socket.IO Chat Logic
// =========================

io.on('connection', (socket) => {

    console.log('⚡ User connected:', socket.id);


    socket.on('join_roadmap', (roadmapId) => {
        socket.join(roadmapId);
        console.log(`User ${socket.id} joined roadmap ${roadmapId}`);
    });


    socket.on('send_message', (data) => {

        console.log("Chat Message:", data);

        socket.to(data.roadmapId).emit('receive_message', data);
    });


    socket.on('update_roadmap', (data) => {

        socket.to(data.roadmapId).emit('roadmap_updated', data.roadmap);

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



// =========================
// GEMINI AI API
// =========================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {

    console.warn("⚠️ GEMINI_API_KEY missing in server/.env");

}


app.post('/api/generate-roadmap', async (req, res) => {

    try {

        const { formData } = req.body;

        if (!formData || !formData.idea) {

            return res.status(400).json({
                error: "Missing formData"
            });

        }


        const {
            idea,
            timeline,
            category,
            budget,
            teamSize,
            creatorName,
            scope
        } = formData;


        const sizeInt = parseInt(teamSize) || 1;



        const systemPrompt = `
You are an expert CTO and Product Manager.

Idea:
"${idea}"

Category:
"${category}"

Timeline:
"${timeline} weeks"

Team Size:
${sizeInt}

Creator:
"${creatorName}"

Scope:
${scope}

Budget:
${budget || 0}

Return STRICT JSON with root array named "phases".

Each phase:

{
 title,
 tasks:[]
}

Each task:

id
title
estimatedHours
completed=false
assignee
cost
prereqs

details:
whatThisMeans
whatThisMeansExample[]
whyItMatters[]
whatYouNeedToDo[]
output
outputExample

Make tasks realistic.
`;


        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: systemPrompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json"
                    }

                })

            }
        );


        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(errorText);

        }


        const data = await response.json();

        let responseText =
            data.candidates[0].content.parts[0].text.trim();


        if (responseText.startsWith("```json"))
            responseText = responseText.substring(7);

        if (responseText.endsWith("```"))
            responseText = responseText.substring(0,
                responseText.length - 3);


        const roadmap = JSON.parse(responseText.trim());


        res.json({
            roadmap
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            error: "AI generation failed"
        });

    }

});



// =========================
// Shared Roadmaps
// =========================


const sharedRoadmaps = new Map();



app.post('/api/share', (req, res) => {

    const { roadmap } = req.body;

    if (!roadmap || !roadmap.id)
        return res.status(400).json({
            error: "Invalid roadmap"
        });


    const shareId =
        Math.random().toString(36)
            .substring(2, 8)
            .toUpperCase();


    sharedRoadmaps.set(shareId, roadmap);


    res.json({
        shareId
    });

});



app.get('/api/shared-roadmap/:id', (req, res) => {

    const { id } = req.params;


    if (sharedRoadmaps.has(id))
        res.json({
            roadmap:
                sharedRoadmaps.get(id)
        });

    else
        res.status(404).json({
            error: "Not found"
        });

});



app.post('/api/shared-roadmap/:id/join', (req, res) => {

    const { id } = req.params;
    const { name } = req.body;


    if (!name)
        return res.status(400).json({
            error: "Missing name"
        });


    if (!sharedRoadmaps.has(id))
        return res.status(404).json({
            error: "Not found"
        });


    const roadmap =
        sharedRoadmaps.get(id);


    if (!roadmap.teamMembers)
        roadmap.teamMembers = [];


    if (!roadmap.teamMembers.includes(name))
        roadmap.teamMembers.push(name);


    io.to(roadmap.id)
        .emit('roadmap_updated', roadmap);


    res.json({
        teamMembers:
            roadmap.teamMembers
    });

});



// =========================
// SERVE FRONTEND
// =========================

app.use(express.static(
    path.join(__dirname, '../dist')
));


app.get('*', (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            '../dist/index.html'
        )
    );

});



// =========================
// START SERVER
// =========================


server.listen(PORT, () => {

    console.log(`✅ Server running on port ${PORT}`);

});