import { LevelPart, TileGrid } from "@local/tiles";
import React, { useState } from "react";
import { TileGridViewer } from "./tile-grid-viewer";

export const LevelPartsViewer = ({
    levelParts,
}: {
        levelParts: (LevelPart & {
            symbolsTop___?: string;
            symbolsBottom?: string;
            symbolsLeft__?: string;
            symbolsRight_?: string;
            allowedTop___?: number[];
            allowedBottom?: number[];
            allowedLeft__?: number[];
            allowedRight_?: number[];
        })[]
}) => {

    return (
        <div
            className="flex flex-row flex-wrap border-solid border-lime-600 border-2"
        >
            {levelParts.map((x, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-col p-2 text-white">
                        <div>
                            {i}
                        </div>
                        <div className="flex flex-row justify-center items-center">
                            {x.symbolsLeft__ && (<div>{x.symbolsLeft__}</div>)}
                            <div className="flex flex-col justify-center items-center">
                                {x.symbolsTop___ && (<div>{x.symbolsTop___}</div>)}
                                <TileGridViewer tileGrid={x} />
                                {x.symbolsBottom && (<div>{x.symbolsBottom}</div>)}
                            </div>
                            {x.symbolsRight_ && (<div>{x.symbolsRight_}</div>)}
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};