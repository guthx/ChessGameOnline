import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import forwardFilled from '@iconify-icons/ant-design/forward-filled';
import fastForwardFilled from '@iconify-icons/ant-design/fast-forward-filled';

function MoveHistory({ moveHistory, viewState }) {
    const [selectedMove, setSelectedMove] = useState(moveHistory.length - 1);

    useEffect(() => {
        setSelectedMove(moveHistory.length - 1);
    }, [moveHistory]);

    const changeSelection = (move) => {
        setSelectedMove(move);
        viewState(move + 1);
    }
    var numbering = [];
    var rows = [];
    for (let i = 1; i <= (moveHistory.length - 1) / 2 + 1; i++) {
        let move1, move2 = null;
        let i1 = (i - 1) * 2;
        let i2 = (i - 1) * 2 + 1;
        move1 = (
            <div
                onClick={() => changeSelection(i1)}
                className={`move ${i1 == selectedMove ? "selected" : ""}`}>
                {moveHistory[i1]}
            </div>
        );

        if (moveHistory[i2] != undefined)
            move2 = (
                <div
                    onClick={() => changeSelection(i2)}
                    className={`move ${i2 == selectedMove ? "selected" : ""}`}>
                    {moveHistory[i2]}
                </div>
                );
        rows.push(
            <div
                key={i}
                className={'move-history-row'}>
                {move1}
                {move2}
            </div>
        );
        numbering.push(
            <div className={'turn-number'} key={i}>
                {i}
            </div>
        );
    }

    return (
        <div id={'move-history-menu'}>
            <div id={'move-history'}>
                <div id={'move-history-turn-numbers'}>
                    {numbering}
                </div>
                <div id={'move-history-moves'}>
                    {rows}
                </div>
            </div>
            <div id={'move-history-buttons'}>
                <button
                    onClick={() => changeSelection(-1)}
                    disabled={selectedMove == -1}
                    className={'move-history-button'}
                >
                    <Icon
                        icon={fastForwardFilled}
                        rotate="180deg"  
                    />
                </button>
                <button
                    onClick={() => changeSelection(selectedMove - 1)}
                    disabled={selectedMove == -1}
                    className={'move-history-button'}
                >
                    <Icon
                        icon={forwardFilled}
                        rotate="180deg"
                    />
                </button>
                <button
                    onClick={() => changeSelection(selectedMove + 1)}
                    disabled={selectedMove == moveHistory.length - 1}
                    className={'move-history-button'}
                >
                    <Icon
                        icon={forwardFilled}
                    />
                </button>
                <button
                    onClick={() => changeSelection(moveHistory.length - 1)}
                    disabled={selectedMove == moveHistory.length - 1}
                    className={'move-history-button'}
                >
                    <Icon
                        icon={fastForwardFilled} 
                    />
                </button>
            </div>
        </div>
        );
}

export default React.memo(MoveHistory);