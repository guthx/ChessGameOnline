import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TimeControlSelect from './TimeControlSelect';

const HomeStates = {
    DEFAULT: 0,
    SEARCH_SELECT: 1,
    CREATE_SELECT: 2,
    SEARCHING: 3,
    CREATE_WAIT: 4
}

export function Home(props) {
    const [gameId, setGameId] = useState(0);
    const [state, setState] = useState(HomeStates.DEFAULT);
    const [awaiting, setAwaiting] = useState(false);
    const [searching, setSearching] = useState(false);


    const createGame = (timeControl) => {
        props.hubConnection.invoke("CreateGame", timeControl.time*60*1000, timeControl.increment*1000)
            .then(id => {
                props.hubConnection.on("opponentReady", () => {
                    props.history.push('/game/' + id);
                });
                setGameId(id);
                setState(HomeStates.CREATE_WAIT);
            });
    }

    const searchGame = (timeControl) => {
        props.hubConnection.invoke("SearchGame", timeControl.time * 60 * 1000, timeControl.increment * 1000)
        setState(HomeStates.SEARCHING);
        props.hubConnection.on('gameFound', id => {
            props.history.push('/game/' + id);
            props.hubConnection.off('gameFound');
        });
    }

    const cancelSearch = () => {
        props.hubConnection.invoke("CancelSearch");
        setState(HomeStates.DEFAULT);
    }

    const cancelCreate = () => {
        setState(HomeStates.DEFAULT);
    }

    const useStyles = makeStyles((theme) => ({
        button: {
            marginTop: "20px"
        }
    }));

    const classes = useStyles();
    console.log(props.history);

    switch (state) {
        case HomeStates.DEFAULT:
            return (
                <div id={'wrapper'}>
                    <div id={'home-grid'}>
                        <img src={require('../images/horse.png')} alt="knight"></img>
                        <Button variant="contained" size="large" color="primary" onClick={() => setState(HomeStates.CREATE_SELECT)} >Create custom game</Button>
                        <Button variant="contained" size="large" color="primary" onClick={() => setState(HomeStates.SEARCH_SELECT)} >Search an opponent</Button>
                    </div>
                </div>
            );
        case HomeStates.CREATE_SELECT:
            return (
                <div id={'wrapper'}>
                    <div id={'home-grid'}>
                        <TimeControlSelect
                            onSelect={createGame}
                        />
                        <Button variant="contained" size="large" color="secondary" onClick={() => setState(HomeStates.CREATE_SELECT)} >Create custom game</Button>
                        <Button variant="contained" size="large" color="primary" onClick={() => setState(HomeStates.SEARCH_SELECT)} >Search an opponent</Button>
                    </div>
                </div>
            );
        case HomeStates.SEARCH_SELECT:
            return (
                <div id={'wrapper'}>
                    <div id={'home-grid'}>
                        <TimeControlSelect
                            onSelect={searchGame}
                        />
                        <Button variant="contained" size="large" color="primary" onClick={() => setState(HomeStates.CREATE_SELECT)} >Create custom game</Button>
                        <Button variant="contained" size="large" color="secondary" onClick={() => setState(HomeStates.SEARCH_SELECT)} >Search an opponent</Button>
                    </div>
                </div>
            );
        case HomeStates.SEARCHING:
            return (
                <div id={'wrapper'}>
                    <div id={'searching-container'}>
                        <div id={'searching'}>
                            Searching for an opponent...
                        </div>
                        <div id={'spinner'}>
                            <img src={require('../images/spinner.gif')} alt="spinner" />
                        </div>
                        <Button variant="contained" size="large" color="primary" onClick={() => cancelSearch()}>Cancel search</Button>
                    </div>
                </div>
            );
        case HomeStates.CREATE_WAIT:
            return (
                <div id={'wrapper'}>
                    <div id={'searching-container'}>
                        <div>
                        Send this link to your opponent
                        </div>
                        <input disabled={true} value={window.location.host + '/game/' + gameId} />
                        <div id={'searching'}>
                            Awaiting opponent...
                        </div>
                        <div id={'spinner'}>
                            <img src={require('../images/spinner.gif')} alt="spinner" />
                        </div>
                        <Button variant="contained" size="large" color="primary" onClick={() => cancelCreate()}>Cancel the game</Button>
                    </div>
                </div>
            );
    }
}