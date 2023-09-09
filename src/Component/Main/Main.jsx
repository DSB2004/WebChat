import React, { Children } from 'react'
import Header_Main from '../Header/Header_Main'
import "./Main.css"
import Chat from '../Chat/Chat'
import { FaBell, FaSearch } from 'react-icons/fa'
import user_img from '../../Media/default_user_pic.png'
import { ImSpinner2 } from "react-icons/im"
import axios from 'axios'
export default function Main({ URL }) {
    const [chats, set_chats] = React.useState(<p id="chat_msg">Your Chats will appear here</p>)
    const [url, set_url] = React.useState(URL + "/Main")
    const [userdata, set_data] = React.useState(JSON.parse(sessionStorage.getItem('user')))
    const eventSource = React.useRef(null)
    const temp = React.useRef(null);
    const [block, set_block] = React.useState(
        <>
            <span >🚫<strong>Blocking Contact</strong></span >
            <p>
                By blocking this contact, you are taking the following actions:
            </p>
            <ol style={{ textAlign: 'justify' }}>
                <li>The blocked person will no longer be able to send you messages.</li>
                <li>The blocked person will not have access to your chat and its history.</li>
                <li>You will not receive any messages from the blocked person.</li>
                <li>Your chat history with the blocked person will be permanently deleted and cannot be recovered.</li>
            </ol>
            <p>
                <strong>⚠️ Important:</strong> If you're experiencing harassment or unwanted messages, blocking can help you maintain a safe space within the app.
            </p >
        </>
    )
    const [unblock, set_unblock] = React.useState(<>
        <span>🔓<strong>Unblocking Contact</strong></span>
        <p>
            By unblocking this contact, you are restoring communication and allowing both parties to access the chat.
        </p>
        <p>
            Please note that the chat history prior to unblocking will be permanently deleted. You will only be able to access messages sent after unblocking.
        </p></>
    )
    const [recent, set_recent] = React.useState(<div id="load_div">
        <ImSpinner2 id="load" />
    </div>)
    async function SSEconnnection(data) {
        if (!eventSource.current) {
            eventSource.current = new EventSource(url + `/sse/${userdata.Email}`);
            eventSource.current.addEventListener('message', async (event) => {
                const eventData = JSON.parse(event.data);
                if (eventData.type === "Recent_new") {
                    rearrange(eventData.Email, temp.current)
                }
                else if (eventData.type === "New_contact") {
                    add_new(eventData.content, temp.current)
                }
                else if (eventData.type === "New_message") {
                    new_msg(eventData.Email, temp.current)
                }
                else if (eventData.type === "Notification") {
                    bell_ring()
                }

            });
            eventSource.current.addEventListener('error', (event) => {
                console.error('SSE Error:', event);
            });
        }
    }

    async function block_change(data) {
        const block_data = { request_by: userdata.Email, block: data.Receiver_Email, chatroom: data.Chatroom_id, status: data.block }
        const url_ = url + "/block"
        const response = await axios.post(url_, block_data)
        if (response) {
            if (data.block === true) {
                data.block = false
            }
            else if (data.block === false) {
                data.block = true
            }
            set_chats(<Chat value={data} onValueChange={contentChange} URL_={url} />)
        }
    }
    async function delete_chat(data) {
        const delete_chat = { request_by: userdata.Email, other: data.Receiver_Email, chatroom: data.Chatroom_id }
        const url_ = url + "/delete"
        const response = await axios.post(url_, delete_chat)
        if (response) {
            set_chats(<p id="chat_msg">Your Chats will appear here</p>)
        }
    }
    const contentChange = (todo, data) => {
        if (todo === "exit") {
            set_chats(<p id="chat_msg">Your Chats will appear here</p>)
        }
        else if (todo === "block") {

            if (data.block === true) {
                set_chats(<div id="load_div">
                    <div id="block_div">
                        <p id="block_content">{unblock}</p>
                        <div id="block_btn_div">
                            <button className='block_btn' onClick={() => { block_change(data) }}>Yes</button>
                            <button className='block_btn' onClick={() => { set_chats(<Chat value={data} onValueChange={contentChange} URL_={url} />) }}>No</button>
                        </div>
                    </div>
                </div>)
            }
            else if ((data.block === false)) {
                set_chats(<div id="load_div">
                    <div id="block_div">
                        <p id="block_content">{block}</p>
                        <div id="block_btn_div">
                            <button className='block_btn' onClick={() => { block_change(data) }}>Yes</button>
                            <button className='block_btn' onClick={() => { set_chats(<Chat value={data} onValueChange={contentChange} URL_={url} />) }}>No</button>
                        </div>
                    </div>
                </div>)
            }
        }
        else if (todo === "delete") {
            set_chats(<div id="load_div">
                <div id="block_div">
                    <p id="block_content">
                        <p>
                            ⚠️ <strong style={{ marginBottom: '10px' }}>Warning</strong>: Deleting Chat
                        </p>

                        <p>
                            You are about to delete this chat conversation. This action cannot be undone. Once deleted, you and the other participant(s) will lose access to this chat forever. Are you sure you want to proceed?
                        </p>

                        <p>
                            <strong>Deleting the chat will result in:</strong>
                        </p>
                        <ol style={{ textAlign: 'justify' }}>
                            <li>Permanently erasing all messages exchanged.</li>
                            <li>Both you and the other participant(s) losing access to the conversation.</li>
                            <li>No way to recover the chat or its content.</li>
                        </ol>
                        <div id="block_btn_div">
                            <button className='block_btn' onClick={() => { delete_chat(data) }}>Yes</button>
                            <button className='block_btn' onClick={() => { set_chats(<Chat value={data} onValueChange={contentChange} URL_={url} />) }}>No</button>
                        </div>
                    </p>
                </div>
            </div >
            )
        }
    }
    async function search() {
        const search = document.querySelector("#input").value
        if (search !== "") {
            set_recent(<div id="load_div">
                <ImSpinner2 id="load" />
            </div>)
            const url_ = url + "/search"
            const data = { Search: search, request_by: userdata.Email }
            const response = await axios.post(url_, data)
            if (response.data.length === 0) {
                set_recent(<div id="chat_msg">
                    No User named "{search}" found
                </div>)
                setTimeout(() => {
                    recent_()
                }, 5000)
            }
            else {
                let search_object = []
                const search_data = response.data
                search_data.forEach(element => {
                    if (element.Email === userdata.Email) {
                        { }
                    }
                    else {
                        if (element.Photo !== undefined) {
                            search_object.push(create_div(element))
                        }
                        else if (element.Photo === undefined) {
                            search_object.push(create_default_div(element))
                        }

                    }
                });
                set_recent((prevRecent) => search_object)
            }
        }
    }
    async function close_menu() {
        if (window.innerWidth <= 1400) {
            const target = document.querySelector("#searcharea")
            target.style.width = '0px';
            target.style.opacity = "0"
            setTimeout(() => {
                target.style.display = "none";
            }, 200)
        }
    }
    async function rearrange(div_id) {
        const copy_array = []
        temp.current.forEach(element => {
            if (element.props.id === div_id) {
                const new_element = React.cloneElement(element, {}, [element.props.children[0],
                element.props.children[1], <p id="msg_number"></p>])
                copy_array.push(new_element)
            }
        })
        temp.current.forEach(element => {
            if (element.props.id !== div_id) {
                copy_array.push(element)
            }
        })
        temp.current = copy_array
        set_recent(copy_array)

    }
    async function new_msg(div_id) {
        let copy_array = []
        console.log("New_message")
        temp.current.forEach(element => {
            if (element.props.id === div_id) {
                console.log(element)
                let unseen = Number(element.props.children[2].props.children)
                if (unseen) {
                    const new_element = React.cloneElement(element, {}, [element.props.children[0],
                    element.props.children[1], <p id="msg_number">{String(unseen + 1)}</p>])
                    copy_array.push(new_element)
                }
                else {
                    let unseen = 0
                    const new_element = React.cloneElement(element, {}, [element.props.children[0],
                    element.props.children[1], <p id="msg_number">{String(unseen + 1)}</p>])
                    copy_array.push(new_element)
                }
            }
        })
        temp.current.forEach(element => {
            if (element.props.id !== div_id) {
                copy_array.push(element)
            }
        })
        temp.current = copy_array
        set_recent(copy_array)
    }
    async function start_chat(data, notify) {
        if (!notify) {
            rearrange(data.Email, temp.current)
        }
        else if (notify) {
            const response = await axios.post(url + "/remove_notification", { id: data.id_, user: userdata.Email })
            if (response) {
                console.log(response.data)
                await recent_();
            }
        }
        set_chats(<div id="load_div">
            <ImSpinner2 id="load" />
            <p>
                Setting up your Chat with {data.Name}
            </p>
        </div>)
        const url_ = url + "/startchat"
        const chat_data = { Users: [data.Email, userdata.Email], Start_with: data.Email, Requested_by: userdata.Email }
        const response = await axios.post(url_, chat_data)
        console.log(response.data)
        if (response.data.type) {
            const chat = { Receiver_Name: data.Name, Receiver_Email: data.Email, Chatroom_id: response.data.chatroom, Receiver_Photo: data.Photo, block: response.data.blocked, type: response.data.type }
            set_chats(<Chat value={chat} onValueChange={contentChange} URL_={url} />)
        }
        else if (response.data === "blocked") {
            setTimeout(() => {
                set_chats(<div id="load_div">
                    <ImSpinner2 id="load" />
                    <p>
                        You might have been blocked by {data.Name}
                    </p>
                </div>)
            }, 5000)
        }
    }
    async function add_new(data) {
        let copy_object = []
        if (data.Photo) {
            copy_object.push(create_div(data))
        }
        else {
            copy_object.push(create_default_div(data))
        }
        temp.current.forEach(element => {
            copy_object.push(element)
        })

        set_recent(copy_object)
        temp.current = copy_object
    }
    async function recent_() {
        let search_object = []
        const url_ = url + "/recent"
        const response = await axios.post(url_, userdata)
        if (response.data.length === 0) {
            set_recent(
                <div id="load_div">
                    No recent contacts
                </div>
            )
        }
        else {
            var index = 0;
            const search_data = response.data
            search_data.sort((a, b) => {
                const timestampA = new Date(a.last).getTime();
                const timestampB = new Date(b.last).getTime();
                return timestampB - timestampA;
            });
            search_data.map((element) => {
                if (element.Photo !== null) {

                    search_object.push(create_div(element))
                } else if (element.Photo === null) {
                    search_object.push(create_default_div(element))
                }
            })
            temp.current = search_object
            set_recent(search_object)
        }
    }
    function bell_ring() {
        const bell = document.querySelector("#notification_bell")
        bell.style.transform = 'rotate(60deg)';
        setTimeout(() => {
            bell.style.transform = 'rotate(-60deg)';
            setTimeout(() => {
                bell.style.transform = 'rotate(60deg)';
                setTimeout(() => {
                    bell.style.transform = 'rotate(-60deg)';
                    setTimeout(() => {
                        bell.style.transform = 'rotate(0deg)';
                    }, 100);
                }, 100);
            }, 100);
        }, 100);
    }
    async function notification() {
        bell_ring()
        const url_ = url + "/notification"
        const response = await axios.post(url_, userdata)

        set_recent(<div id="load_div">
            <ImSpinner2 id="load" />
        </div>)
        if (response.data.length === 0) {
            set_recent(
                <div id="load_div">
                    No new notification
                </div>
            )
        }
        else {
            let search_object = []
            const search_data = response.data
            search_data.forEach(element => {
                search_object.push(
                    create_notify_div(element)
                )
            });
            set_recent(search_object)
        }
        setTimeout(() => {
            recent_()

        }, 5000)
    }
    function create_notify_div(element_data) {
        return (
            <div className='side' onClick={() => { start_chat(element_data, "notification") }}>
                <div id="notify">
                    <p id="Notify_head">{element_data.type} !!</p>
                    <p id="Notify_content">{element_data.content}</p>
                    <p id="notification_time">
                        {element_data.time}
                    </p>
                </div>

            </div>
        )
    }
    function create_div(element_data) {
        var data = ""
        if (element_data.unseen && element_data.unseen > 0) {
            data = element_data.unseen
        }
        return (
            <div className='side' id={element_data.Email} onClick={() => { start_chat(element_data) }}>
                <img src={element_data.Photo} id="user_image" alt="" />
                <div id="user_data">
                    <p id="user_name">{element_data.Name}</p>
                    <p id="user_email">{element_data.Email}</p>
                </div>

                <p id="msg_number">{data}</p>
            </div>
        )
    }
    function create_default_div(element_data, index, array) {
        var data = ""
        if (element_data.unseen && element_data.unseen > 0) {
            data = element_data.unseen
        }
        return (
            <div className='side' id={element_data.Email} key={index} onClick={() => { start_chat(element_data, index, array) }}>
                <img src={user_img} id="user_image" alt="" />
                <div id="user_data">
                    <p id="user_name">{element_data.Name}</p>
                    <p id="user_email">{element_data.Email}</p>
                </div>
                <p id="msg_number">{data}</p>
            </div>
        )
    }

    async function verify_user() {

        if (sessionStorage.getItem('user') === null) {
            window.location.href = "/"
        }
        else {
            const response = await axios.post(url, { Session_key: userdata.Session, Email: userdata.Email })
            if (response.data === "all ok") {
                await recent_()
                await SSEconnnection(userdata)
            }
            else {
                window.location.href = "/"
            }

        };

    }
    React.useEffect(() => {
        verify_user()
        return () => {
            if (eventSource.current) {
                eventSource.current.close()
            }
        };
    }, [])
    return (
        <>
            <Header_Main />
            <div id="Main_div">
                <div className='main' id="searcharea" >
                    <div id="search">
                        <input id="input" type="text" placeholder="Search here..." />
                        <FaSearch onClick={search} id="searchbtn" />
                        <FaBell id="notification_bell" onClick={notification} />
                    </div>
                    <div id="prev_chat" onClick={close_menu}>
                        {recent}

                    </div>
                </div>
                <div className='main' id="chatarea">
                    <div id="chat">
                        {chats}
                    </div>

                </div>
            </div >
        </>
    )
}
