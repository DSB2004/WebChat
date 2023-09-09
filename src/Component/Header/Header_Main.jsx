import React from 'react';
import { FaBars, FaCommentDots } from 'react-icons/fa';
import './Header.css';
import { open_search, account_set } from './Header_function';
export default function Header_Main() {
    const [account, set_account] = React.useState("")
    const [search_menu, set_searchmenu] = React.useState(false)
    React.useEffect(() => {
        if (sessionStorage.getItem('user') === null) {
            window.location.href = "/"
        }
        else {
            set_account(account_set(JSON.parse(sessionStorage.getItem('user'))))
        }
    }, [])
    return (
        <>
            <div id="header" data-div="web_div">
                <FaCommentDots id="logo" />
                <h2 id="head_name">
                    WebChat
                </h2>
                <FaBars onClick={() => { set_searchmenu(open_search(search_menu)) }} id="open_Search" />
                <div id="user_div">
                    {account}
                </div>
            </div >

        </>

    )
}
