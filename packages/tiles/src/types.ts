import { Char, Vector2 } from '@local/core';

export type Tile = {
    symbol: Char;
    position: Vector2;
};

export type TileGrid<TTile extends Tile = Tile> = {
    /**
     * y:0 = bottom
     * row,col: [y][x]
     * */
    tiles: TTile[][];
    size: Vector2;
};

