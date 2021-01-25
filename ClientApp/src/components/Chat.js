import React, { useState } from 'react';
import SendIcon from '@material-ui/icons/Send';

function Chat({ messages, sendMessage }) {
    const [message, setMessage] = useState("");

    const send = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            if (message.trim() != "") {
                sendMessage(message.slice(0, 100));
                setMessage("");
            }
        }
    } 

    return (
        <div className={'chatbox'}>
            <div className={'messages'}>
            {messages.map((m, i) => (
                <div key={i} className={'message'}>
                    <b>{m.player}: </b>
                    {m.message}
                </div>
            ))}
            </div>
            <div className={'send-message-box'}>
                <input
                    type="text"
                    placeholder="Type message here..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyUp={e => send(e)}
                />
            </div>
        </div>
        );
}

export default React.memo(Chat)


/*
 <button onClick={() => sendMessage(message)}>
                    <SendIcon />
                </button>
                */