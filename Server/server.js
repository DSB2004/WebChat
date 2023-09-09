const WebSocket = require('ws');
const express = require('express')
const cors = require('cors')
// const https = require('https')
const http = require('http')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const path = require('path')
const app = express()
const { connectDB, Add_user, recent, SSEconnection, delete_chat, change_password, remove_notification, verify, SignUp, check_OTP, SignIn, Google_SignIn, search, startChat, store_msg, previous_chat, notification, block_, session_checker, add_msg_indicator, notify_receiver, update_receiver } = require("./serverside_function")
const server = http.createServer(app)
const wss = new WebSocket.Server({ server });
app.use(express.json())
app.use(express.urlencoded())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
connectDB()
wss.on('connection', (ws, req) => {
    const chatroomID = req.url.substr(1);
    ws.chatroomID = chatroomID;
    wss.clients.forEach(client => {
        if (client.chatroomID === chatroomID && client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify({ status: "Online" }))
            ws.send(JSON.stringify({ status: "Online" }))
        }
    })
    ws.on('message', async (message) => {
        let user = 1;
        let msg_data = JSON.parse(message);
        ws.send(JSON.stringify({ msg_status: "received", identifier: msg_data.identifier }))
        const send_to = msg_data.chatroom
        wss.clients.forEach(client => {
            if (
                client !== ws &&
                client.readyState === WebSocket.OPEN &&
                client.chatroomID === send_to
            ) {
                user += 1;
                client.send(JSON.stringify(msg_data));
                msg_data.SeenBy = [msg_data.Receiver]
                ws.send(JSON.stringify({ msg_status: "done", identifier: msg_data.identifier }))
            }
        });
        if (user === 1) {
            await add_msg_indicator(msg_data)

        }
        await store_msg(msg_data)
    });
    ws.on('close', () => {
        wss.clients.forEach(client => {
            if (client.chatroomID === chatroomID && client !== ws) {
                client.send(JSON.stringify({ status: "Offline" }))
            }
        })
    });
});
app.use(express.static(path.join(__dirname, 'build')));

app.get("/Main/sse/:userID", async (req, res) => {
    const userId = req.params.userID; //
    SSEconnection(userId, res, req)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.post('/Signup', cors(), async (req, res) => {
    console.log("SignUp")
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await SignUp(sanitized_input))
});
app.post('/Signup/OTP', cors(), async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    const response = await check_OTP(sanitized_input)
    if (response === "all ok") {
        res.send(await Add_user(sanitized_input))
    }
    else {
        res.send(response)
    }
})
app.post('/SignIn', cors(), async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await SignIn(sanitized_input))
})
app.post('/SignIn/Google', cors(), async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await Google_SignIn(sanitized_input))
})

app.post('/SignIn/forget', cors(), async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    user_data = sanitized_input
    res.send(await verify(sanitized_input))
})
app.post('/SignIn/verify_OTP', cors(), async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await check_OTP(sanitized_input))
})
app.post('/SignIn/new_password', cors(), async (req, res) => {
    const user_input = req.body.Password;
    const user_email = user_data.Email
    const sanitized_input = DOMPurify.sanitize(user_input);
    const new_password = { Email: user_email, Password: sanitized_input }
    const response = await change_password(new_password)
    res.send(response)

})

app.post("/Main", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(session_checker(sanitized_input))
})
app.post("/Main/notify_user", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await notify_receiver(sanitized_input))
})
app.post("/Main/update_user", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await update_receiver(sanitized_input))
})
app.post("/Main/recent", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await recent(sanitized_input))
})
app.post("/Main/search", async (req, res) => {
    const user_input = req.body.Search;
    const sanitized_input = DOMPurify.sanitize(user_input);

    res.send(await search(sanitized_input))
})
app.post("/Main/delete", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    console.log(sanitized_input)
    res.send(await delete_chat(sanitized_input))
})
app.post("/Main/startchat", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await startChat(sanitized_input))
})
app.post("/Main/History", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await previous_chat(sanitized_input))
})
app.post("/Main/Notification", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await notification(sanitized_input))
})
app.post("/Main/block", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await block_(sanitized_input))
})
app.post("/Main/remove_notification", async (req, res) => {
    const user_input = JSON.stringify(req.body);
    const san_input = DOMPurify.sanitize(user_input);
    const sanitized_input = JSON.parse(san_input)
    res.send(await remove_notification(sanitized_input))
})
server.listen(80, () => {
    console.log(`URL: http://localhost`)
})
