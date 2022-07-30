import { TileGrid } from "@local/tiles";
import React, { useState } from "react";

export const TileGridViewer = ({
    tileGrid,
}: {
    tileGrid: TileGrid
}) => {

    const [test, setTest] = useState('TEST 2');

    return (
        <div
            className="border-solid border-lime-600 border-2"
        >
            {[...new Array(tileGrid.size.x)].map((_, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-row">
                        {[...new Array(tileGrid.size.y)].map((_, j) => (
                            <React.Fragment key={j}>
                            {/* <div>{`[${w},${h}]:${JSON.stringify(tileGrid.tiles[w][h])}`}</div> */}
                                <div
                                    className={`flex flex-row items-center justify-center 
                                    w-8 h-8
                                    border-solid border-white border
                                    bg-black text-red-600
                                    text-sm
                                    `}
                                >{`${tileGrid.tiles[i][j].symbol}`}</div>
                        </React.Fragment>
                    ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};