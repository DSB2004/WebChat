import React from 'react'
import "./sign.css"
import { Link } from 'react-router-dom'
import { ImSpinner2 } from "react-icons/im"
import Header from '../Header/Header'
import axios from 'axios'
export default function SignIn({ URL }) {
    const [msg, set_msg] = React.useState('')
    const [Name, set_name] = React.useState('')
    const [Email, set_email] = React.useState('')
    const [Password, set_password] = React.useState('')
    const [User_data, set_data] = React.useState('')
    const [url, set_url] = React.useState(URL + "/SignUp")
    const [option, set_option] = React.useState(
        <>
            <Link data-text="web_text" to="/SignIn" id="alert_bar">Already have an account  ??</Link>
        </>
    )
    const submit = async (e) => {
        set_msg(<ImSpinner2 id="loading" />);
        e.preventDefault();
        if (Email === '' || Password === '') {
            set_msg("Fields can't be empty");
            return;
        }
        if (Password.length < 8) {
            set_msg("Password can't be less than 8 characters");
            return;
        }
        try {
            const user_data = { Name, Email, Password, type: "Normal" };
            set_data({ Name, Email, Password, type: "Normal" })
            const response = await axios.post(url, user_data);
            if (response.data === "all ok") {
                set_msg("")
                set_option(
                    <>
                        <input data-div="web_div" id="OTP" data-text="web_text" className="SignInput" type="text" placeholder='Enter the OTP' />
                        <div data-text="web_text" data-div="web_div" id="submit_btn" onClick={submit_otp}>
                            Submit OTP
                        </div>
                    </>
                );
            } else {
                set_msg(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const submit_otp = async () => {
        set_msg(<ImSpinner2 id="loading" />)
        const url_ = url + "/OTP"
        const otp = document.querySelector("#OTP").value
        const data = { OTP: otp, User_data }
        const response = await axios.post(url_, data)
        if (typeof response.data === "object") {
            sessionStorage.setItem("user", JSON.stringify(response.data))
            window.location.href = "/Main"
        }
        else {
            set_msg(response.data);
        }
    }
    return (
        <>
            <div id="back_div">
            </div>
            <div id="front_div">
            </div>
            <Header />
            <div id="Component" >
                <div id="sign" data-div="web_div">
                    <h2 id="sign_head" data-text="web_text">Welcome to WebChat</h2>
                    <p id="head_msg" data-text="web_text">SignUp via Email</p>
                    <input onChange={(e) => { set_name(e.target.value) }} className="SignInput" type="text" placeholder='Enter your name...' />
                    <input onChange={(e) => { set_email(e.target.value) }} className="SignInput" type="text" placeholder="Enter your email address..." />
                    <input onChange={(e) => { set_password(e.target.value) }} className="SignInput" type="password" placeholder="Create a new password" />
                    <div data-text="web_text" data-div="web_div" id="submit_btn" onClick={submit}>
                        Proceed to create account
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
