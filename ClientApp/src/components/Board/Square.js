import React, { useEffect, useState } from 'react'
import PieceImage from './PieceImage';
import { PieceType } from '../../enums';
import Label from './Label';

function Square(props) {
    const [state, setState] = useState(props.state);

    useEffect(() => {
        setState(props.state);
    }, [props])

    const mouseEnter = () => {
        if (state.highlighted == true) {
            setState({
                ...state,
                selected: true
            });
        }      
    }
    const mouseLeave = () => {
        if (state.selected == true) {
            setState({
                ...state,
                selected: false
            });
        }
    }

    if (state.promotion == false) {
        let squareClass = state.backgroundClass;
        if (state.moved)
            squareClass += ' moved';
        if (state.selected)
            squareClass += ' dragged-over';
        let highlight = null;
        if (state.highlighted == true) {
            highlight = (<span className={'dot'}></span>);
        }

        return (
            <div
                id={String.fromCharCode(65 + state.file) + (state.rank + 1)}
                className={squareClass}
                onMouseDown={(e) => props.mouseDown(state.file, state.rank, e.target.lastChild)}
                onMouseUp={(e) => props.mouseUp(e, state.file, state.rank)}
                onMouseEnter={() => mouseEnter()}
                onMouseLeave={() => mouseLeave()}
                f={state.file}
                r={state.rank}
            >
                <Label
                    color={state.color}
                    f={state.file}
                    r={state.rank}
                />
                {highlight}
                <PieceImage symbol={state.symbol} />
            </div>
        );
    }
    else {
        return (
            <div
                id={String.fromCharCode(65 + state.file) + (state.rank + 1)}
                className={'highlighted-square'}
                onClick={() => props.promote(typeOfPiece(state.symbol))}
                f={state.file}
                r={state.rank}
            > 
                <Label
                    color={state.color}
                    f={state.file}
                    r={state.rank}
                />
                <PieceImage symbol={state.symbol} />
            </div>
        );
    }
    
}

function typeOfPiece(symbol) {
    symbol = symbol.toLowerCase();
    switch (symbol) {
        case 'q':
            return PieceType.QUEEN;
        case 'n':
            return PieceType.KNIGHT;
        case 'b':
            return PieceType.BISHOP;
        case 'r':
            return PieceType.ROOK;
    }
}

export default React.memo(Square, (prevProps, nextProps) => {
    return
        prevProps.state.symbol == nextProps.state.symbol &&
        prevProps.state.promotion == nextProps.state.promotion &&
        prevProps.state.moved == nextProps.state.moved &&
        prevProps.state.highlighted == nextProps.state.highlighted &&
        prevProps.state.selected == nextProps.state.selected;
});



