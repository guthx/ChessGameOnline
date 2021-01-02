import React, { useState, useEffect, memo } from 'react'

function Timer(props) {
    const [time, setTime] = useState(props.time);

    const timeString = () => {
        if (time < 0)
            return "0:00";
        let minutes = Number.parseInt(time / 60);
        let seconds = Number.parseInt(time) - minutes * 60;

        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes.toString() +  ":" + seconds;
    }
    useEffect(() => {
        if (props.highlight == true) {
            const timer = setTimeout(() => {
                setTime(time - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    })
    useEffect(() => {
        setTime(props.time);
    }, [props.time])

    if (props.highlight == true)
        return (
            <div className={'timer highlighted'}>
                {timeString()}
            </div>
        );
    else
        return (
            <div className={'timer'}>
                {timeString()}
            </div>
        );
}

export default React.memo(Timer);