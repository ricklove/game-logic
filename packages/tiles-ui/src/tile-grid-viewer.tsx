import React from 'react';
import { Tile, TileGrid } from '@local/tiles';

export const TileGridViewer = <T extends Tile>({
    tileGrid,
    CustomComponent,
}: {
        tileGrid: TileGrid<T>;
        CustomComponent?: (props: { tile: T }) => JSX.Element;
}) => {

    return (
        <div
            className='border-solid border-lime-600 border-2'
        >
            {[...new Array(tileGrid.size.y)]
                .map((_, j) => j)
                .reverse().map(j => (
                    <React.Fragment key={j}>
                        <div className='flex flex-row'>
                            {[...new Array(tileGrid.size.x)].map((_, i) => (
                                <React.Fragment key={i}>
                                    {CustomComponent && (<CustomComponent tile={tileGrid.tiles[j][i]} />)}
                                    {!CustomComponent && (
                                        <div
                                            className={`flex flex-row items-center justify-center 
                                            w-4 h-4
                                            border-solid border-slate-900 border
                                            bg-black text-red-600
                                            text-sm
                                            `}
                                        >{`${tileGrid.tiles[j][i].symbol}`}</div>
                                    )}
                        </React.Fragment>
                    ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};
