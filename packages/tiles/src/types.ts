import { Int32, Vector2 } from '@local/core';

export type Tile = {
    symbol: string;
    position: Vector2;
};

export type TileGrid = {
    tiles: Tile[][];
    size: Vector2;
};

