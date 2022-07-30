import { TileGrid } from "@local/tiles";
import React, { useState } from "react";

export const TileGridViewer = ({
    tileGrid,
}: {
    tileGrid: TileGrid
}) => {

    const [test, setTest] = useState('TEST 2');

    return (
        <div>
            {[...new Array(tileGrid.width)].map((_, w) => (
                <React.Fragment key='w'>
                    {[...new Array(tileGrid.height)].map((_, h) => (
                        <React.Fragment key='h'>
                            <div>{`[${w},${h}]:${JSON.stringify(tileGrid.tiles[w][h])}`}</div>
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};