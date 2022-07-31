import { Vector2, Int32, Char, ValueTypes } from "@local/core";
import { TileGrid, Tile } from "./types";

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
            }))
    };
};