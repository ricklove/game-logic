import { LevelPart, TileGrid } from "@local/tiles";
import React, { useState } from "react";
import { TileGridViewer } from "./tile-grid-viewer";

export const LevelPartsViewer = ({
    levelParts,
}: {
    levelParts: LevelPart[]
}) => {

    return (
        <div
            className="flex flex-row flex-wrap border-solid border-lime-600 border-2"
        >
            {levelParts.map((x, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-col p-2">
                        <div className="text-white">
                            {i}
                        </div>
                        <TileGridViewer tileGrid={x} />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};