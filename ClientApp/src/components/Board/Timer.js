import React, { useState, useEffect } from 'react'

function Timer(props) {
    const [time, setTime] = useState(props.time);

    const timeString = () => {
        if (time < 0)
            return "0:00";
        let minutes = Number.parseInt(time / 60, 10);
        let seconds = Number.parseInt(time, 10) - minutes * 60;

        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return minutes.toString() +  ":" + seconds;
    }
    useEffect(() => {
        if (props.highlight === true) {
            const timer = setTimeout(() => {
                setTime(time - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    })
    useEffect(() => {
        setTime(props.time);
    }, [props.time, props.highlight])

    if (props.highlight === true)
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