import { LevelPart, TileGrid } from "@local/tiles";
import React, { useState } from "react";
import { TileGridViewer } from "./tile-grid-viewer";

export const LevelPartsViewer = ({
    levelParts,
    allLevelParts,
}: {
        levelParts: LevelPart[];
        allLevelParts?: LevelPart[];
}) => {

    return (
        <div
            className="flex flex-row flex-wrap border-solid border-lime-600 border-2"
        >
            {levelParts.map((x) => (
                <React.Fragment key={x.index}>
                    <LevelPartView levelPart={x} allLevelParts={allLevelParts} />
                </React.Fragment>
            ))}
        </div>
    );
};

const LevelPartView = ({
    levelPart,
    allLevelParts,
    zIndex = 1,
}: {
    levelPart: LevelPart;
    allLevelParts?: LevelPart[];
    zIndex?: number;
}) => {
    return (
        <div className="flex flex-col p-2 text-white">
            <div>
                {levelPart.index}
            </div>
            <div className="flex flex-row justify-center items-center">
                {levelPart.isEdgeLeft__ && (<div>⬅</div>)}
                <div className="flex flex-row flex-wrap bg-slate-800 p-1 h-16 w-16 text-xs">{levelPart.allowedLeft__.slice(0, 8).map(i => <LevelPartReference index={i} allLevelParts={allLevelParts} zIndex={zIndex + 1} />)}</div>
                <div>{levelPart.symbolsLeft__}</div>
                <div className="flex flex-col justify-center items-center">
                    {levelPart.isEdgeTop___ && (<div>⬆</div>)}
                    <div className="flex flex-row flex-wrap bg-slate-800 p-1 h-16 w-16 text-xs">{levelPart.allowedTop___.slice(0, 8).map(i => <LevelPartReference index={i} allLevelParts={allLevelParts} zIndex={zIndex + 1} />)}</div>
                    <div>{levelPart.symbolsTop___}</div>
                    <TileGridViewer tileGrid={levelPart} />
                    <div>{levelPart.symbolsBottom}</div>
                    <div className="flex flex-row flex-wrap bg-slate-800 p-1 h-16 w-16 text-xs">{levelPart.allowedBottom.slice(0, 8).map(i => <LevelPartReference index={i} allLevelParts={allLevelParts} zIndex={zIndex + 1} />)}</div>
                    {levelPart.isEdgeBottom && (<div>⬇</div>)}
                </div>
                <div>{levelPart.symbolsRight_}</div>
                <div className="flex flex-row flex-wrap bg-slate-800 p-1 h-16 w-16 text-xs">{levelPart.allowedRight_.slice(0, 8).map(i => <LevelPartReference index={i} allLevelParts={allLevelParts} zIndex={zIndex + 1} />)}</div>
                {levelPart.isEdgeRight_ && (<div>➡</div>)}
            </div>
        </div>
    );
};

export const LevelPartReference = ({
    index,
    allLevelParts,
    zIndex = 1,
}: {
    index: number;
    allLevelParts?: LevelPart[];
    zIndex?: number;
}) => {

    const [expanded, setExpanded] = useState(false);
    const levelPart = allLevelParts?.find(x => x.index === index);

    return (
        <div className="relative pl-1 text-yellow-400"
        >
            <div
                className="cursor-pointer"
                onClick={() => setExpanded(s => !s)}
            >{index}</div>
            {expanded && levelPart && (
                <div className="absolute bg-slate-700"
                    style={{ zIndex }}
                >
                    <LevelPartView levelPart={levelPart} allLevelParts={allLevelParts} zIndex={zIndex + 1} />
                </div>
            )}
        </div>
    );
};