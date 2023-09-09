import React from 'react'
import { IoMdDoneAll } from "react-icons/io"
import { MdOutlineDone } from "react-icons/md"
import { AiOutlineLoading } from 'react-icons/ai'
export default function Message_div({ id, msg, seen, key, time }) {
    const [status_icon, set_icon] = React.useState()
    React.useEffect(() => {
        if (seen === "received") {
            set_icon(
                <MdOutlineDone id="tick" />)
        }
        else if (seen === "done") {
            set_icon(<IoMdDoneAll id="tick" />)
        }
        else if (seen === "sent") {
            set_icon(<AiOutlineLoading id="message_loader" />)
        }
    }, [seen])
    if (id === "user_msg") {
        return (
            <>
                <div id="user_msg" className="msg" key={key} >
                    <p id="msg_content">{msg}</p>
                    <p id="msg_status">
                        {time}
                        {status_icon}
                    </p>
                </div >
            </>
        );
    }
    else if (id === "frn_msg") {
        return (
            <>
                <div id="frn_msg" className="msg" key={key} >
                    <p id="msg_content">{msg}</p>
                    <p id="msg_status">{time}</p>
                </div>
            </>
        );
    }

}
