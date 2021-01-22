import React from 'react';
import { Color } from '../../enums';

function Label({ color, f, r }) {
    let label;
    let file = String.fromCharCode(65 + f);
    let rank = r + 1;
    if (color == Color.WHITE || color == Color.SPECTATE) {
        if (f == 7 && r == 0)
            label = (
                <div className={'square-label-double'}>
                    <div className={'square-label-file'}>
                        {file.toLowerCase()}
                    </div>
                    <div className={'square-label-rank'}>
                        {rank}
                    </div>
                </div>
            );
        else if (f == 7) {
            label = (
                <div className={'square-label-rank'}>
                    {rank}
                </div>
            );
        }
        else if (r == 0) {
            label = (
                <div className={'square-label-file'}>
                    {file.toLowerCase()}
                </div>
            );
        }
    } else {
        if (f == 0 && r == 7)
            label = (
                <div className={'square-label-double'}>
                    <div className={'square-label-file'}>
                        {file.toLowerCase()}
                    </div>
                    <div className={'square-label-rank'}>
                        {rank}
                    </div>
                </div>
            );
        else if (f == 0) {
            label = (
                <div className={'square-label-rank'}>
                    {rank}
                </div>
            );
        }
        else if (r == 7) {
            label = (
                <div className={'square-label-file'}>
                    {file.toLowerCase()}
                </div>
            );
        }
    }
    return label;
}

export default React.memo(Label);