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
        methods: ['GET','POST']
    }
});

const PORT = process.env.PORT || 10000;


// Middleware
app.use(cors());
app.use(express.json());



/* ===========================
   SOCKET.IO CHAT
=========================== */

const sharedRoadmaps = new Map();

io.on('connection', (socket)=>{

    console.log("User Connected:", socket.id);


    socket.on('join_roadmap',(roadmapId)=>{
        socket.join(roadmapId);
    });


    socket.on('send_message',(data)=>{
        socket.to(data.roadmapId).emit('receive_message',data);
    });


    socket.on('update_roadmap',(data)=>{

        socket.to(data.roadmapId).emit('roadmap_updated',data.roadmap);

        for(const [key,value] of sharedRoadmaps.entries()){
            if(value.id === data.roadmapId){
                sharedRoadmaps.set(key,data.roadmap);
                break;
            }
        }

    });


    socket.on('disconnect',()=>{
        console.log("User Disconnected:",socket.id);
    });

});



/* ===========================
   GEMINI API
=========================== */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


app.post('/api/generate-roadmap',async(req,res)=>{

try{

const {formData} = req.body;

if(!formData || !formData.idea){
return res.status(400).json({error:"Missing idea"});
}


const prompt = `Create a structured roadmap for this idea:

Idea: ${formData.idea}
Timeline: ${formData.timeline}
Category: ${formData.category}

Return JSON only.
`;

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify({
contents:[
{
parts:[
{text:prompt}
]
}
]
})
}
);


const data = await response.json();

let text = data.candidates[0].content.parts[0].text;

res.json({roadmap:text});


}catch(err){

console.log(err);

res.status(500).json({
error:"AI failed"
});

}

});



/* ===========================
   SHARING ROADMAP
=========================== */

app.post('/api/share',(req,res)=>{

const {roadmap} = req.body;

const shareId =
Math.random()
.toString(36)
.substring(2,8)
.toUpperCase();

sharedRoadmaps.set(shareId,roadmap);

res.json({shareId});

});


app.get('/api/shared-roadmap/:id',(req,res)=>{

const id = req.params.id;

if(sharedRoadmaps.has(id)){
res.json({
roadmap:sharedRoadmaps.get(id)
});
}
else{
res.status(404).json({
error:"Not found"
});
}

});



/* ===========================
   SERVE FRONTEND
=========================== */


app.use(express.static(path.join(__dirname,'../dist')));


app.get('*',(req,res)=>{

res.sendFile(
path.join(__dirname,'../dist/index.html')
);

});



/* ===========================
   START SERVER
=========================== */

server.listen(PORT,()=>{

console.log("Server running on port",PORT);

});
