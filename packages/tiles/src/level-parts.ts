import { Char, Int32, ValueTypes, Vector2 } from "@local/core/lib/src/types";
import { Tile, TileGrid } from "./types";


export type LevelPart = TileGrid & {
    key: string,
};

export const extractLevelParts = (levelPartsSource: string, options?: { partSize: Vector2 }): LevelPart[] => {
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
    } = options ?? {};

    const lines = levelPartsSource.split('\n')
        .map(x => x.trim()).filter(x => x)
        .reverse();

    const maxLineLength = Math.max(...lines.map(x => x.length));

    const parts: LevelPart[] = [...new Array(lines.length - partSize.y + 1)].flatMap((_, yTop) => {

        return [...new Array(maxLineLength - partSize.x + 1)].map((_, xLeft) => {
            const tiles: TileGrid['tiles'] = [...new Array(partSize.y)].map((_, py) => {
                return [...new Array(partSize.x)].map((_, px) => {

                    const tx = ValueTypes.Int32(xLeft + px);
                    const ty = ValueTypes.Int32(yTop + py);

                    const tile: Tile = {
                        position: ValueTypes.Vector2({ x: tx, y: ty }),
                        symbol: ValueTypes.Char(lines[ty].substring(tx, tx + 1)),
                    };
                    return tile;
                })
            });
            const part: LevelPart = {
                key: tiles.map(rows => rows.map(r => r.symbol).join('')).join(''),
                size: partSize,
                tiles,
            };

            if (part.key.length < partSize.x * partSize.y) {
                return undefined;
            }

            return part;
        }).filter(x => x).map(x => x!);
    });

    const distinctParts = [...new Map(parts.map(x => [x.key, x])).values()];
    return distinctParts;
};