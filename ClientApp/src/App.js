import React, { Component, useEffect, useState } from 'react';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Switch, BrowserRouter, Route, useHistory } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import Cookies from 'js-cookie';

export const HubContext = React.createContext(null);

export default function App()  {
    //displayName = App.name
    const [hubConnection, setHubConnection] = useState(null);
    const [token, setToken] = useState(Cookies.get('token'));
    const [connected, setConnected] = useState(false);
    const history = useHistory();
    useEffect(() => {
        if (token != undefined) {
            var hub = new signalR.HubConnectionBuilder()
                .withUrl("/hubs/game", {
                    accessTokenFactory: () => {
                        return token;
                    },
                    skipNegotiation: false,
                   // transport: signalR.HttpTransportType.WebSockets
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();
            hub.on('reconnect', gameId => {
                history.push('/game/' + gameId);
            });
            hub.start()
                .then(() => {
                    setHubConnection(hub);
                    setConnected(true);
                })
                .catch(log => console.log(log));
            
            setHubConnection(hub);
        }
        
        
    }, [token]);

    useEffect(() => {
        if (token == undefined) {
            fetch('api/Game/jwt')
                .then(res => res.text())
                .then(jwt => {
                    setToken(jwt);
                    Cookies.set('token', jwt, { sameSite: 'strict' });
                });
        }
    }, [token])

    if (!connected)
        return null;
    else
    return (
      
        <div>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous" />
     
                
            <Route
                exact path='/'
                render={(props) => (
                    <Home {...props} hubConnection={hubConnection} />
                )}
            />
            <Route
                exact path='/game/:id'
                render={(props) => (
                    <Game {...props} hubConnection={hubConnection} />
                )}
            />
                
  
        </div>
      
    );
}
