const ndm = require('nodemailer')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { signing, Mail } = require('./serverside_content')
const User = require('./Schema/User')
const Chat = require('./Schema/Chat_info')
const Message = require('./Schema/Message')
var User_connected = []
var OTP_list = []
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // You can adjust the key size as needed
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});
const sseConnections = new Map();
function SSEconnection(userId, res, req) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    sseConnections.set(userId, res);
    console.log(`User connected ${userId}`)
    req.on('close', () => {
        sseConnections.delete(userId);
        console.log(`User disconnected ${userId}`)
    });
}
function send_update(UserID, data) {
    const clientResponse = sseConnections.get(UserID);
    if (clientResponse) {
        clientResponse.write(`event: ${data.event}\n`);
        clientResponse.write(`data: ${JSON.stringify(data.data)}\n\n`);
    }
}
async function connectDB() {
    const uri = "mongodb+srv://WebChat:oMu5jJAqjkMMbFIj@webchat.7nseytu.mongodb.net/?retryWrites=true&w=majority";
    try {
        await mongoose.connect(uri)
        console.log("Connected")
    } catch {
        console.log(err)
    }
}
function create_OTP() {
    const x = parseInt(Math.random() * 100000000000).toString()
    console.log(x)
    return x
}
async function check_OTP(data) {
    const OTP = data.OTP
    if (OTP_list.includes(OTP)) {
        for (let i = 0; i < OTP_list.length; i++) {
            if (OTP_list[i] === OTP) {
                OTP_list.splice(i, 1);
                i--;
            }
        }
        return signing.ok
    }
    else {
        return signing.otp_inc
    }
}

function mail(user_id, template) {
    const transport = ndm.createTransport({
        service: "Gmail",
        auth: {
            user: "fitnessfreak1412@gmail.com",
            pass: "nzdotbqieaqwhmfv"
        },
    });


    const mail = {
        from: {
            name: 'WebChat',
            address: "fitnessfreak1412@gmail.com"
        },
        to: user_id,
        subject: template.subject,
        html: template.content,
        headers: {
            'Content-Type': 'text/html'
        }
    };

    transport.sendMail(mail, (err, data) => {
        if (err) {
            console.log("Request Failed\nError:404");
            console.log(`\nError:${err}`);
        } else {
            console.log("Email sent successfully");
        }
    });
}
async function create_account(data) {
    try {
        const new_user = new User(data.User_data)
        const hash = await bcrypt.hash(new_user.Password, 10)
        new_user.Password = hash
        await new_user.save()
        mail(new_user.Email, Mail.welcome())
        const session_key = session_id_add(data.Email)
        return { Name: data.Name, Email: data.Email, Session: session_key }
    }
    catch (err) {
        console.log(err)
        return signing.acc_F
    }
}
async function check_user(data) {
    const response = await User.find({ Email: data.Email })
    if (response.length === 0) {
        const OTP = create_OTP()
        OTP_list.push(OTP)
        mail(data.Email, Mail.new_OTP(data.Name, OTP))
        return signing.ok
    }
    else if (response.length > 0) {
        var google_user = false
        response.forEach(element => {
            if (element.type === "Google") {
                google_user = true
            }
        })
        if (google_user === true) {
            return signing.google
        }
        else {
            return signing.acc_F
        }
    }
}

async function verify(data) {
    const response = await User.findOne({ Email: data.Email })
    if (response) {
        const OTP = create_OTP()
        OTP_list.push(OTP)
        mail(data.Email, Mail.forget_OTP(data.Name, OTP))
        return signing.ok
    }
    else if (!response) {
        return signing.acc_nf
    }
}

async function change_password(data) {
    try {
        const user = await User.findOne({ Email: data.Email });
        if (!user) {
            return signing.acc_nf;
        } else {
            const hash = await bcrypt.hash(data.Password, 10);
            await User.updateOne({ Email: data.Email }, { Password: hash });
            return signing.ok;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function google_signin(data) {
    const user = await User.findOne({ Email: data.Email, type: "Google" });
    if (!user) {
        try {
            const g_data = new User(data)
            mail(data.Email, Mail.welcome())
            await g_data.save()
            const session_key = session_id_add(data.Email)
            return { Name: data.Name, Email: data.Email, Session: session_key, photo: data.Photo }
        }
        catch (err) {
            console.log(err)
            return signing.acc_F;
        }
    }
    else if (user) {
        await User.updateOne({ Email: data.Email, type: "Google" }, { Photo: data.Photo });
        const session_key = session_id_add(data.Email)
        return { Name: data.Name, Email: data.Email, Session: session_key, photo: data.Photo }
    }
}

async function verification(data) {
    const response = await User.findOne({ Email: data.Email, type: "Normal" })
    if (response) {
        try {
            const status = await bcrypt.compare(data.Password, response.Password)
            if (status === true) {
                const session_key = session_id_add(data.Email)
                return { Name: response.Name, Email: response.Email, Session: session_key }
            }
            else {
                return signing.pass_inc
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    else {
        const response_1 = await User.findOne({ Email: data.Email, type: "Google" })
        if (response_1) {
            return signing.google
        }
        else {
            return signing.acc_nf
        }
    }
}

async function recent_contact(data) {
    const user_id = data.Email
    const response = await User.findOne({ Email: user_id })
    if (response) {
        if (response.Recent_Contact.length === 0) {
            return null
        }
        else {
            const contacts = response.Recent_Contact
            return contacts
        }
    }
}
async function search(data) {
    const Requested_by = data.requested_by
    const response = await User.find({ Name: { $regex: data, $options: 'i' } })
    if (response.length !== 0) {
        const data = []
        response.forEach(element => {
            if (!element.Block.includes(Requested_by)) {
                const user_Data = { Name: element.Name, Email: element.Email, Photo: element.Photo }
                data.push(user_Data)
            }
        });
        return data
    } else if (response.length === 0) {
        return null
    }
}
function chatroom_generator() {
    chatroom = String(parseInt(Math.random() * 1000000000000))
    return chatroom
}
async function block_(data) {
    const request_user = data.request_by
    const block = data.block
    if (data.status === false) {
        await User.updateOne({ Email: request_user }, { $push: { Block: block } })
    }
    else if (data.status === true) {
        await User.updateOne({ Email: request_user }, { $pull: { Block: block } })
    }
    await Message.deleteMany({ chatroom: data.chatroom })
    return "done"
}
async function startChat(data) {
    const User1 = data.Requested_by
    const User2 = data.Start_with
    const filter = { Email: User1, 'Recent_Contact.Email': User2 };
    const update = { 'Recent_Contact.$.unseen': 0 }
    await User.updateOne(filter, update);
    const Users = data.Users;
    const User1_data = await User.findOne({ Email: User1 })
    const User2_data = await User.findOne({ Email: User2 })
    if (!User2_data.Block.includes(User1)) {
        let response = await Chat.find({
            Users: {
                $all: Users,
                $size: Users.length
            }
        });
        if (response.length === 0) {
            let Chatroom_id = chatroom_generator();
            const user2_update = { Email: User2, Name: User2_data.Name, Photo: User2_data.Photo, chatroom: Chatroom_id, unseen: 0, last: new Date() }
            await User.updateOne({ Email: User1 }, { $push: { 'Recent_Contact': user2_update } });
            await add_notification({ to_send: User1, from: User2, type: "New Contact", content: `${User2} added as contact`, chatroom: Chatroom_id, })

            const chat_data = new Chat({
                Users: Users,
                chatroom: Chatroom_id
            });
            var block = false
            if (User1_data.Block.includes(User2)) {
                block = true
            }
            const chat_content = {
                Users: Users,
                chatroom: Chatroom_id,
                blocked: block,
                type: "new"
            }
            await chat_data.save();
            return chat_content;
        }
        else {
            var block = false
            if (User1_data.Block.includes(User2)) {
                block = true
            }
            const chat_content = {
                Users: response[0].Users,
                chatroom: response[0].chatroom,
                blocked: block,
                type: "old"
            }
            return chat_content;
        }
    }
    else {
        return "blocked"
    }
}
async function update_receiver(data) {
    const User1 = data.requested_by
    const User2 = data.to_update
    const response = User.findOne({ Email: User2 })
    const response1 = await User.updateOne({ Email: User2, 'Recent_Contact.Email': User1 }, { $set: { 'Recent_Contact.$.last': new Date() } });
    const response2 = await User.updateOne({ Email: User1, 'Recent_Contact.Email': User2 }, { $set: { 'Recent_Contact.$.last': new Date() } });
    send_update(User2, { event: "message", data: { type: "Recent_new", Email: User1 } })
    if (response1 && response2) {
        return "User updated"
    }
}
async function notify_receiver(data) {
    const User1 = data.requested_by
    const User2 = data.to_update
    const Users = [User1, User2]
    let response = await Chat.findOne({
        Users: {
            $all: Users,
            $size: Users.length
        }
    });
    const User1_data = await User.findOne({ Email: User1 })
    const user1_update = { Email: User1, Name: User1_data.Name, Photo: User1_data.Photo, chatroom: response.chatroom, unseen: 0, last: new Date() }
    const response1 = await User.updateOne({ Email: User2 }, { $push: { 'Recent_Contact': user1_update } });
    if (response1) {
        const response2 = await add_notification({ to_send: User2, from: User1, type: "New Contact", content: `${User1} added as contact`, chatroom: response.chatroom, })
        send_update(User2, { event: "message", data: { type: "New_contact", Email: User1, content: { Email: User1, Name: User1_data.Name, Photo: User1_data.Photo, unseen: 1 } } })
        send_update(User2, { event: "message", data: { type: "Notification" } })
        return "Receiver notified"
    }

}
async function add_msg_indicator(data) {
    const filter = { Email: data.Receiver, 'Recent_Contact.Email': data.UserID };
    const update = { $inc: { 'Recent_Contact.$.unseen': 1 } };
    const response = await User.updateOne(filter, update);
    send_update(data.Receiver, { event: "message", data: { type: "New_message", Email: data.UserID } })
}
async function store_msg(data) {
    const msg_data = new Message(data)
    const response = await msg_data.save()
    return response
}
async function previous_chat(data) {
    const user = data.requested_by;
    await Message.updateMany(
        { chatroom: data.chatroom, SeenBy: [], Receiver: user },
        { $push: { SeenBy: user } }
    );
    const new_response = await Message.find({ chatroom: data.chatroom });
    return new_response;
}


async function delete_chat(data) {
    await Message.deleteMany({ chatroom: data.chatroom })
    const notify_other = { to_send: data.other, from: data.request_by, type: "Chat history", content: `${data.request_by} has deleted the chat history` }
    const notify_requester = { from: data.other, to_send: data.request_by, type: "Chat history", content: `You have deleted the chat history` }
    await add_notification(notify_other)
    await add_notification(notify_requester)
    send_update(data.other, { event: "message", data: { type: "Notification" } })
    return "done"
}
function time_set() {
    var hour = String(new Date().getHours())
    var minutes = String(new Date().getMinutes())
    if (minutes.length === 1) {
        minutes = "0" + minutes;
    }
    const time = `${hour}:${minutes}`
    return time
}
async function notification(data) {
    const response = await User.findOne({ Email: data.Email })
    if (!response) {
        return null
    }
    else {
        const notifications = response.Notification
        return notifications
    }

}
function session_id_add(email) {
    const x = String(parseInt(Math.random() * 1000000000000000))
    User_connected.push({ key: x, User_: email })
    const session_number = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(x, 'utf-8')
    );
    console.log("User_list:", User_connected)
    return session_number
}
function session_id_check(data) {
    if (User_connected.length !== 0 && data.Session_key !== null && data.Session_key) {
        try {
            const session_verify = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(data.Session_key, 'base64')
            );
            const session_key = session_verify.toString('utf-8');
            let i = 0;
            User_connected.forEach(element => {
                if (element.User_ === data.Email && element.key === session_key) {
                    i++
                }
            })
            if (i === 1) {
                return signing.ok
            }
        }
        catch (err) {
            console.log(err)
            return;
        }
    }
}
async function add_notification(data) {
    const response = await User.findOne({ Email: data.from })
    await User.updateOne({ Email: data.to_send }, { $push: { 'Notification': { id_: chatroom_generator(), type: data.type, content: data.content, time: time_set(), chatroom: data.chatroom, Email: data.from, Photo: response.Photo, Name: response.Name } } });
}
async function remove_notification(data) {
    const response = await User.findOne({ Email: data.user })
    const response1 = await User.updateOne({ Email: data.user, }, { $pull: { 'Notification': { id_: data.id } } });
    if (response1) {
        return "done"
    }

}

module.exports = {
    notify_receiver: notify_receiver,
    update_receiver: update_receiver,
    add_msg_indicator: add_msg_indicator,
    remove_notification: remove_notification,
    session_checker: session_id_check,
    notification: notification,
    add_notificaiton: add_notification,
    previous_chat: previous_chat,
    mail: mail,
    SSEconnection: SSEconnection,
    store_msg: store_msg,
    Add_user: create_account,
    SignIn: verification,
    Google_SignIn: google_signin,
    SignUp: check_user,
    verify: verify,
    block_: block_,
    connectDB: connectDB,
    OTP: create_OTP,
    check_OTP: check_OTP,
    change_password: change_password,
    recent: recent_contact,
    search: search,
    delete_chat: delete_chat,
    startChat: startChat
};