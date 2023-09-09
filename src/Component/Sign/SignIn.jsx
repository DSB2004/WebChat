import React from 'react'
import "./sign.css"
import { Link } from 'react-router-dom'
import { ImSpinner2 } from "react-icons/im"
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../Module/auth'
import { FaGoogle } from 'react-icons/fa'
import Header from '../Header/Header'
import axios from 'axios'

export default function SignIn({ URL }) {
    const [msg, set_msg] = React.useState('')
    const [Email, set_email] = React.useState('')
    const [Password, set_password] = React.useState('')
    const [url, set_url] = React.useState(URL + "/SignIn")
    const [option, set_option] = React.useState(
        <>
            <div id="other_option">
                <p data-text="web_text" id="option_head">More options</p>
                <div onClick={google_signin} id="google">
                    <FaGoogle />
                    SignIn with Google</div>
            </div>
            <Link data-text="web_text" onClick={forget} to="#" id="alert_bar">Opps..forget password</Link>
            <Link data-text="web_text" to="/SignUp" id="alert_bar">SignUp via Email</Link>
        </>
    )
    async function google_signin() {
        signInWithPopup(auth, provider)
            .then(async (data) => {
                let photo = data.user.providerData[0].photoURL
                let data_ = { Email: data.user.email, Name: data.user.displayName, Photo: photo, type: "Google" }
                const url_ = url + "/Google"
                try {
                    const response = await axios.post(url_, data_);
                    if (typeof response.data === "object") {
                        sessionStorage.setItem("user", JSON.stringify(response.data))
                        window.location.href = "/Main"
                    }
                    else {
                        set_msg(response.data);
                    }
                }
                catch (err) {
                    console.log(err)
                }
            })
    }
    const submit = async (e) => {
        set_msg(<ImSpinner2 id="loading" />);
        e.preventDefault();
        const user_data = { Email, Password }
        if (Email === null) {
            set_msg("UserID can't be negative");
            return;
        }
        try {
            const response = await axios.post(url, user_data);
            if (typeof response.data === "object") {
                sessionStorage.setItem("user", JSON.stringify(response.data))
                window.location.href = "/Main"
            }
            else {
                set_msg(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const submit_email = async () => {
        const url_ = url + "/forget"
        try {
            const Email = document.querySelector("#Email").value
            const response = await axios.post(url_, { Email });
            if (response.data === "all ok") {
                document.querySelector("#Email").value = '';
                set_email(Email)
                set_option(
                    <>
                        <p id="head_msg">Enter OTP</p>
                        <input id="OTP" className="SignInput" type="text" placeholder='Enter the OTP' />
                        <div id="submit_btn" onClick={submit_OTP}>
                            Submit OTP
                        </div>
                    </>
                )
            } else {
                set_msg(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    const submit_OTP = async () => {
        const url_ = url + "/verify_OTP"
        const OTP = document.querySelector("#OTP").value
        const response = await axios.post(url_, { OTP })
        if (response.data === "all ok") {
            document.querySelector("#OTP").value = '';
            set_option(
                <>
                    <p id="head_msg" data-text="web_text">Enter Password</p>
                    <input data-div="web_div" id="password" data-text="web_text" className="SignInput" type="password" placeholder='Create new password' />
                    <div data-text="web_text" data-div="web_div" id="submit_btn" onClick={submit_password}>
                        Create a new Password
                    </div>
                </>
            )
        }
        else {
            set_msg(response.data)
        }
    }
    async function submit_password() {
        set_msg(<ImSpinner2 id="loading" />)
        const url_ = url + "/new_password"
        const Password = document.querySelector("#password").value
        const response = await axios.post(url_, { Email, Password })
        if (response.data === "all ok") {
            window.location.href = "/SignIn"
        }
        else {
            set_msg(response.data)
        }
    }
    function forget() {
        set_msg('')
        set_option(
            <>
                <p id="head_msg" >Enter your registered email</p>
                <input id="Email" onChange={(e) => { set_email(e.target.value) }} className="SignInput" type="text" placeholder="Enter your email address..." />
                <div id="submit_btn" onClick={submit_email}>
                    Submit Email
                </div>

            </>
        )
    }
    return (
        <>
            <div id="back_div">
            </div>
            <div id="front_div">
            </div>
            <Header />
            <div id="Component" >
                <div id="sign" >
                    <h2 id="sign_head">Welcome to WebChat</h2>
                    <p id="head_msg">SignIn via Email</p>
                    <input onChange={(e) => { set_email(e.target.value) }} className="SignInput" type="text" placeholder="Enter your UserID..." />
                    <input onChange={(e) => { set_password(e.target.value) }} className="SignInput" type="password" placeholder="Enter your new password" />
                    <div onClick={submit} id="submit_btn" >
                        Proceed to verification
                    </div>
                    <div id="option_div">

                        {option}
                    </div>
                    <p data-text="web_text" id="error_msg">{msg}</p>
                </div>
            </div>
        </>
    )
}