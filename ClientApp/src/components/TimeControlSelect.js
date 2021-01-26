import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const timeControls = [
    { time: 1, increment: 0 },
    { time: 3, increment: 0 },
    { time: 3, increment: 2 },
    { time: 5, increment: 0 },
    { time: 5, increment: 5 },
    { time: 10, increment: 0 },
    { time: 10, increment: 5 },
    { time: 30, increment: 0 }
];

export default function TimeControlSelect({ onSelect }) {
    const [custom, setCustom] = useState(false);
    const [time, setTime] = useState(5);
    const [increment, setIncrement] = useState(0);

    if (!custom) {
        return (
            <div
                className={'time-control-select'}
            >
                {timeControls.map((control, i) => (
                    <div
                        key={i}
                        className={'time-control'}
                        onClick={() => onSelect(control)}
                    >
                        {control.time} + {control.increment}
                    </div>
                ))}
                <div
                    className={'time-control'}
                    onClick={() => setCustom(true)}
                >
                    Custom
                </div>
            </div>
        );
    }
    else {
        return (
            <div className={'custom-time-control'}>
                <button 
                    className={'return'}
                    onClick={() => setCustom(false)}
                >
                    <CloseIcon />
                </button>
                <div className={'select'}>
                    <div>Time: {time}</div>
                    <input
                        type="range"
                        className={'slider'}
                        min="1"
                        max="60"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
                <div className={'select'}>
                    <div>Increment: {increment}</div>
                    <input
                        type="range"
                        className={'slider'}
                        min="0"
                        max="30"
                        value={increment}
                        onChange={(e) => setIncrement(e.target.value)}
                    />
                </div>
                <Button variant="contained" size="large" color="primary" onClick={() => onSelect({ time: time, increment: increment })}>
                    Create game
                </Button>
            </div>
        );
    }
    
}