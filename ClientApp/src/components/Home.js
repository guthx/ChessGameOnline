import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { withRouter } from 'react-router-dom';
import { Col, Grid, Row } from 'react-bootstrap';
import { Container, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


export function Home(props) {
    
    const [sessionId, setSessionId] = useState("");
    const [gameId, setGameId] = useState(0);
    const [awaiting, setAwaiting] = useState(false);
    const [searching, setSearching] = useState(false);

    const createGame = () => {
        props.hubConnection.invoke("CreateGame", 3000000, 2000)
            .then(id => {
                props.hubConnection.on("opponentReady", () => {
                    console.log('/game/' + id);
                    props.history.push('/game/' + id);
                });
                setGameId(id);
                setAwaiting(true);
            });
        
    }

    const searchGame = () => {
        props.hubConnection.invoke("SearchGame", 60000000, 2000)
        setSearching(true);
        props.hubConnection.on('gameFound', id => {
            props.history.push('/game/' + id);
            props.hubConnection.off('gameFound');
        });
    }

    const AwaitingOpponent = () => {
        if (awaiting == true)
            return (
                <div>
                    <div>
                        Send this link to your opponent:
                    <input disabled={true} value={window.location.host + '/game/' +  gameId }/>
                    </div>
                    <div className={'awaiting'}>
                        Awaiting opponent...
                </div>
                </div>
            );
        else
            return null;
    }

    const SearchingOpponent = () => {
        if (searching == true) {
            return (
                <div id={'searching'}>
                    Searching for an opponent...
                    <div id={'spinner'}>
                        <img src={require('../images/spinner.gif')} />
                    </div>
                </div>
            );
        } else return null;
    }

    const useStyles = makeStyles((theme) => ({
        button: {
            marginTop: "20px"
        }
    }));

    const classes = useStyles();
    console.log(props.history);
    return (
        <Container fluid height={'100%'}>
            <Col sm={3}></Col>
                <Col sm={6}>
                <Row className={'h-50'}>
                    <img src={require('../images/horse.jpg')}></img>
                </Row>
                <Row className={'h-25'}>
                    <Button variant="contained" size="large" color="primary" className={classes.button} onClick={createGame} >Create custom game</Button>
                    <Button variant="contained" size="large" color="primary" className={classes.button} onClick={searchGame} >Search an opponent</Button>
                </Row>
                <Row className={'h-25'}>
                    <SearchingOpponent />
                    <AwaitingOpponent />
                </Row>
                </Col>
            <Col sm={3}></Col>
        </Container>
    );
}