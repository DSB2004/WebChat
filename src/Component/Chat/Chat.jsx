import React, { useEffect } from 'react';
import { FaPaperPlane, FaCircle, FaUserAltSlash, FaTrash } from 'react-icons/fa';
import './Chat.css'
import user_img from '../../Media/default_user_pic.png'
import Message_div from './Message_div';
import { BiSolidExit } from 'react-icons/bi'
import { AiOutlineLeft } from "react-icons/ai"
import CryptoJS from 'crypto-js';
import axios from 'axios'
export default function Chat({ value, onValueChange, URL_ }) {
    const [msg, set_msg] = React.useState('');
    const websocket = React.useRef(null);
    const [Chat_Data, set_Chat] = React.useState(value)
    const [type, set_type] = React.useState(value.type)
    const [current_Status, set_Current_status] = React.useState("New")
    const [status, set_status] = React.useState("")
    const [chat_pic, set_pic] = React.useState(Chat_Data.Receiver_Photo)
    const [chat_option, set_option] = React.useState(false)
    const [msg_block, set_msg_block] = React.useState('')
    const [unseen_array, update_array] = React.useState([])
    const [url, set_url] = React.useState(URL_)
    async function block_check() {
        if (Chat_Data.Receiver_Photo || Chat_Data.Receiver !== null) {
            set_pic(Chat_Data.Receiver_Photo)
        }
        else {
            set_pic(user_img)
        }
        const input_div = document.querySelector("#input_div")
        const block_banner = document.querySelector("#block_display")
        if (Chat_Data.block === true) {
            block_banner.style.display = "block"
            input_div.style.display = "none"

        }
        else if (Chat_Data.block === false) {
            block_banner.style.display = "none"
            await history()
            websocket_connection()
        }
    }
    function auto_Scrolling() {
        const messageContainer = document.getElementById('message_div');
        const lastMessage = messageContainer.lastElementChild;

        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }
    function chat_option_() {
        const chat_div = document.querySelector("#chat_div")
        const chat_btn = document.querySelector("#chat_option_btn")
        if (chat_option === false) {
            set_option(true)
            chat_div.style.display = "flex"
            setTimeout(() => {
                chat_btn.style.transform = 'rotate(180deg)'
                chat_div.style.width = "100px"
                chat_div.style.opacity = "1"
            }, 10)
        }
        else if (chat_option === true) {
            set_option(false)
            chat_btn.style.transform = 'rotate(0deg)'
            chat_div.style.width = "0px"
            chat_div.style.opacity = "0"
            setTimeout(() => {
                chat_div.style.display = "none"
            }, 200)
        }
    }
    async function history() {
        const url_ = url + "/history"
        const request = JSON.parse(sessionStorage.getItem("user"))
        const response = await axios.post(url_, { chatroom: Chat_Data.Chatroom_id, requested_by: request.Email })
        if (response.data.length !== 0) {
            response.data.forEach(element => {
                const msg_content = element;
                const decryptedBytes = CryptoJS.AES.decrypt(
                    msg_content.Msg,
                    msg_content.Key,
                    { iv: msg_content.iv }
                );
                const msg = decryptedBytes.toString(CryptoJS.enc.Utf8);
                if (element.UserID === request.Email) {
                    if (element.SeenBy.includes(Chat_Data.Receiver_Email)) {
                        const newMessage = <Message_div id={"user_msg"} time={element.time} key={element.identifier} msg={msg} seen={"done"} />;
                        set_msg_block(prevMessages => [...prevMessages, newMessage]);
                    }
                    else if (element.SeenBy.length === 0) {
                        const newMessage = <Message_div id={"user_msg"} key={element.identifier} msg={msg} seen={"received"} time={element.time} />;
                        set_msg_block(prevMessages => [...prevMessages, newMessage]);
                        update_array([...unseen_array, element.identifier])
                    }
                }
                else if (element.UserID !== request.Email) {
                    const newMessage = <Message_div key={element.identifier} time={element.time} id={"frn_msg"} msg={msg} />;
                    set_msg_block(prevMessages => [...prevMessages, newMessage]);
                }

            });
        }
        auto_Scrolling()
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
    async function first_chat() {
        const sender = JSON.parse(sessionStorage.getItem("user"))
        if (type === "new") {
            set_type("old")
            const chat_comb_data = { to_update: Chat_Data.Receiver_Email, requested_by: sender.Email }
            const response = await axios.post(url + "/notify_user", chat_comb_data)
            if (response) {
                return "done"
            }
        }
        else {
            return "done"
        }
    }
    async function update_user_list() {
        if (current_Status === "New") {
            const sender = JSON.parse(sessionStorage.getItem("user"))
            set_Current_status("Old")
            const chat_comb_data = { to_update: Chat_Data.Receiver_Email, requested_by: sender.Email }
            const response = await axios.post(url + "/update_user", chat_comb_data)
            if (response) {
                return "done"
            }
        }
        else {
            return "done"
        }
    }
    async function send() {
        const input_div = document.querySelector("#input_div")
        input_div.style.display = "none"
        const response = await first_chat()
        if (response) {
            const response1 = await update_user_list()
            if (response1) {
                input_div.style.display = "block"
                if (msg !== "") {
                    const sender = JSON.parse(sessionStorage.getItem("user"))
                    const keyLength = 256;
                    const randomKey = CryptoJS.lib.WordArray.random(keyLength / 8);
                    const iv = CryptoJS.enc.Utf8.parse('my-iv');
                    const encryptedMessage = CryptoJS.AES.encrypt(
                        msg,
                        randomKey,
                        { iv: iv }
                    ).toString();
                    const sending_time = time_set()
                    const identifier = String(parseInt(Math.random() * 1000000000000000))
                    const newMessage = <Message_div id={"user_msg"} msg={msg} seen={"sent"} key={identifier} time={sending_time} />;
                    if (status === "") {
                        update_array([...unseen_array, identifier])

                    }
                    set_msg_block(prevMessages => [...prevMessages, newMessage]);
                    auto_Scrolling()
                    const msg_content = { UserID: sender.Email, time: sending_time, Receiver: Chat_Data.Receiver_Email, Msg: encryptedMessage, Key: randomKey, chatroom: Chat_Data.Chatroom_id, iv: iv, identifier: identifier };
                    try {
                        websocket.current.send(JSON.stringify(msg_content));

                    } catch (err) {
                        console.log('Send error:', err);
                        network_alert()
                    }
                    set_msg('');
                }
            }
        }

    }
    function network_alert() {
        alert(`🌐 Internet Connection Issue 🌐It appears that your internet connection is experiencing difficulties. This might impact your ability to use our services fully. Please check your internet connection and ensure it's stable.
        `);
    };

    function websocket_connection() {
        if (!websocket.current) {
            websocket.current = new WebSocket(`ws://${window.location.hostname}/${Chat_Data.Chatroom_id}`)
            websocket.current.onopen = () => {
            };
            websocket.current.onmessage = (event) => {
                const msg_content = JSON.parse(event.data);
                if (msg_content.Msg !== undefined) {
                    const decryptedBytes = CryptoJS.AES.decrypt(
                        msg_content.Msg,
                        msg_content.Key,
                        { iv: msg_content.iv }
                    );
                    const msg = decryptedBytes.toString(CryptoJS.enc.Utf8);
                    const newMessage = <Message_div id={"frn_msg"} msg={msg} time={time_set()} />;
                    set_msg_block(prevMessages => [...prevMessages, newMessage]);
                }
                else if (msg_content.identifier !== undefined) {
                    const Key = msg_content.identifier;
                    set_msg_block(prevMessages => {
                        return prevMessages.map(message => {
                            if (String(message.key) === String(Key)) {
                                return React.cloneElement(message, { seen: msg_content.msg_status });
                            }
                            return message;
                        });
                    });
                }
                else if (msg_content.status !== undefined) {
                    if (msg_content.status === "Online") {
                        set_status(<FaCircle id="status_icon" />)
                    }
                    else if (msg_content.status === "Offline") {
                        set_status('')
                    }
                }
            };

            websocket.current.onerror = (error) => {
                network_alert()
            };

            websocket.current.onclose = () => {

            };
        }
    }
    function closeConnection() {
        if (websocket.current) {
            websocket.current.close();
            websocket.current = null;
        }
    }
    React.useEffect(() => {
        block_check()
        return () => {
            closeConnection()
        }
    }, [Chat_Data]);
    useEffect(() => {
        if (status !== "" && unseen_array.length !== 0) {
            set_msg_block(prevMessages => {
                return prevMessages.map(message => {
                    if (unseen_array.includes(String(message.key))) {
                        return React.cloneElement(message, { seen: "done" });
                    }
                    update_array([])
                    return message;
                });
            });
        }
    }, [status])

    return (
        <>
            <div id="heading">
                <img src={chat_pic} id="user_pic" alt="" />
                <div>
                    <p id="receiver_name">
                        {Chat_Data.Receiver_Name}
                    </p>
                    <p id="receiver_email">
                        {Chat_Data.Receiver_Email}
                        {status}

                    </p>
                </div>
                <div id="chat_option_div">
                    <div id="chat_inner_div">
                        <div id="chat_div">
                            <FaUserAltSlash className="chat_option" id="block_contact" onClick={() => { onValueChange("block", Chat_Data) }} />
                            <BiSolidExit className="chat_option" onClick={() => { onValueChange("exit") }} />
                            <FaTrash id="delete_chat" className="chat_option" onClick={() => { onValueChange("delete", Chat_Data) }} />
                        </div>
                        <AiOutlineLeft onClick={chat_option_} id="chat_option_btn" />
                    </div>
                </div>

            </div >
            <div id="message_div">
                <div id="block_display" >
                    <strong style={{ display: "block" }}>Blocked Contact</strong> You have blocked <strong>
                        {Chat_Data.Receiver_Name}
                    </strong>
                    . Communication and access to chat history are restricted.
                    <br />
                    <p style={{ fontSize: '12px', margin: '5px' }}>Please note that the blocked contact will not be able to send you messages, and you will not receive messages from them. The chat history with this contact is inaccessible.</p>
                </div>

                {msg_block}
            </div>
            <div id="input_div">
                <input type="text" onChange={(e) => { set_msg(e.target.value) }} value={msg} placeholder="Share your thoughts here" id="message_input" />
                <FaPaperPlane id="send" onClick={send} />
            </div>
        </>
    );
}
