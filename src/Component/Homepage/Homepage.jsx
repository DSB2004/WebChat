import React from 'react'
import Header from '../Header/Header'
import './Homepage.css'
export default function Homepage() {
    const banner = [
        "Connect and Chat.",
        "Messages that Matter.",
        "Express Yourself.",
        "Chat in Real Time.",
        "Chat with Friends.",
        "Chat Securely.",
        "Unleash Your Voice.",
        "Chat Anytime, Anywhere.",
        "Engage and Connect.",
        "Chat Globally.",
        "Join the Chat Revolution."
    ]
    const [typwriter_text, set_typewriter] = React.useState('')
    function typewriter(i) {
        let length = banner.length;
        let element = banner[i];
        if (i < length) {
            let j = 0;
            const adding = setInterval(() => {
                if (j < element.length) {
                    set_typewriter(element.slice(0, j));
                    j++;
                }
                else {
                    clearInterval(adding);

                    setTimeout(() => {
                        const remove = setInterval(() => {
                            if (element.length > 0) {
                                element = element.slice(0, -1);
                                set_typewriter(element);
                            } else {
                                clearInterval(remove);
                                typewriter(i + 1);
                            }
                        }, 20);
                    }, 1000);
                }
            }, 20);
        } else {
            typewriter(0);
        }
    }
    React.useEffect(() => {
        typewriter(0)
    }, [])
    return (
        <>
            <div id="back_div">
            </div>
            <div id="front_div">
            </div>
            <Header />
            <div id="Component" >
                <div id="Home">
                    <div id="Home_heading">
                        Step into a World of Conversations
                    </div>
                    <div id="Home_content">
                        Start connecting and chatting with friends in real time. Join our secure and
                        user-friendly platform to stay in touch with your loved ones, collaborate with
                        colleagues, or meet new people from around the world.
                    </div>
                    <div id="Typewriter">
                        {typwriter_text}
                    </div>
                </div>
            </div>
        </>
    )
}
