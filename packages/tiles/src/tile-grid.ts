import { Vector2, Int32 } from "@local/core";
import { TileGrid, Tile } from "./types";

export const createTileGrid = (size: Vector2): TileGrid => {
    return {
        size,
        tiles: [...new Array(size.x)].map((_, i) =>
            [...new Array(size.y)].map((_, j) => {
                const tile: Tile = {
                    symbol: '.',
                    position: {
                        x: i as Int32,
                        y: j as Int32,
                    }
                };
                return tile;
            }))
    };
};