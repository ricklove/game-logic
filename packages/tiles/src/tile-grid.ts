import { ValueTypes, Vector2 } from '@local/core';
import { Tile, TileGrid } from './types';

export const createTileGrid = <TTile extends Tile = Tile>(size: Vector2, createTile: (position: Vector2) => TTile): TileGrid<TTile> => {
    return {
        size,
        tiles: [...new Array(size.y)].map((_, j) =>
            [...new Array(size.x)].map((_, i) => {
                const tile: TTile = createTile(ValueTypes.Vector2({
                    x: i,
                    y: j,
                }));
                return tile;
            })),
    };
};
