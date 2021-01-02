import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { withRouter } from 'react-router-dom';
import { Col, Grid, Row } from 'react-bootstrap';
import { Container, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import  Timer from '../components/Timer'


export function Test(props) {
    
    const [sessionId, setSessionId] = useState("");
    const [gameId, setGameId] = useState(0);
    const [awaiting, setAwaiting] = useState(false);
    /*
    useEffect(() => {
        var cookieId = Cookies.get('sessionId');
        if (cookieId != undefined)
            setSessionId(cookieId);
        else if (sessionId == "") {
            fetch("/api/SampleData/guid")
                .then(res => res.text())
                .then((result) => {
                    console.log(result);
                    setSessionId(result);
                    Cookies.set('sessionId', result, { sameSite: 'strict' });
                });
        }
    });
    
    useEffect(() => {
        if (gameId != 0) {
            fetch("/api/Game/game?userId=" + sessionId)
                .then(res => res.json())
                .then((result) => {
                    console.log(result);
                });
        }
    }, [gameId]);
    
    var createGame = () => {
        var data = { sessionId };
        console.log(data);
        console.log(JSON.stringify(data));
        fetch("/api/Game/newgame", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionId)
        })
            .then(res => res.json())
            .then(gameId => {
                setAwaiting(true);
                setGameId(gameId);
                awaitOpponent(gameId);
                //history.push('/game/' + gameId);
            });
    };

    const awaitOpponent = (id) => {
        fetch("api/Game/game?userId=" + sessionId)
            .then(res => res.json())
            .then(response => {
                history.push('/game/' + id);
            });
    }
    */

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
    

    const useStyles = makeStyles((theme) => ({
        button: {
            marginTop: "20px"
        }
    }));

    const classes = useStyles();
    console.log(props);
    return (
        <Container fluid height={'100%'}>
            <Col sm={3}></Col>
                <Col sm={6}>
                <Row className={'h-50'}>
                    <img src={require('../images/horse.jpg')}></img>
                </Row>
                <Row className={'h-25'}>
                    <Button variant="contained" size="large" color="primary" className={classes.button} onClick={createGame} >Create new game</Button>
                    <Timer time={241} class={'timer highlighted'}/>
                </Row>
                <Row className={'h-25'}>
                    <AwaitingOpponent />
                </Row>
                </Col>
            <Col sm={3}></Col>
        </Container>
    );
}