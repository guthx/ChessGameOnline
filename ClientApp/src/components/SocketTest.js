import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';




export function SocketTest() {
    const [clientMessage, setClientMessage] = useState("");
    /*
    useEffect(() => {
        hubConnection.on('setClientMessage', message => {
            setClientMessage(message);
        });
    });
    */
    return (
        <div>
            {clientMessage}
        </div>
    );
}