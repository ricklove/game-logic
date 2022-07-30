import { Int32, Vector2 } from '@local/core';

export type Tile = {
    position: Vector2;
};

export type TileGrid = {
    tiles: Tile[][];
    width: Int32;
    height: Int32;
};