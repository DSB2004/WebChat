import React from 'react';
import { FaBars, FaCommentDots } from 'react-icons/fa';
import './Header.css';
import { Link } from 'react-router-dom';
import { open, close } from './Header_function'
import user_policy from '../../Module/WebChat_userpolicy.pdf'
export default function NewHeader() {

    return (
        <>
            <div id="header" data-div="web_div">
                <FaCommentDots id="logo" />
                <h2 id="head_name">
                    WebChat
                </h2>
                <FaBars onClick={() => { open("#dropmenu") }} id="open" className='menubtn' />
                <div id="nav_div">
                    <Link to="/ ">
                        <div data-text="web_text" className="main_nav" >Home</div>
                    </Link>

                    <a href={user_policy} download>
                        <div data-text="web_text" className="main_nav">User Policy</div>
                    </a>

                    <Link to="/SignIn">
                        <div className="main_nav" >SignIn</div>
                    </Link>
                </div>
            </div>
            <div id="dropmenu" >
                <div id="drop_head">
                    <FaCommentDots id="logo" />
                    <h2 id="head_name">
                        WebChat
                    </h2>
                    <FaBars onClick={() => { close("#dropmenu") }} id="close" className='menubtn' />
                </div>
                <div id="drop_div">
                    <Link to="/ ">
                        <div className="main_nav" >Home</div>
                    </Link>
                    <a href={user_policy} download>
                        <div className="main_nav">User Policy</div>
                    </a>

                    <Link to="/SignIn">
                        <div className="main_nav" >SignIn</div>
                    </Link>
                </div>
            </div >

        </>

    )
}
