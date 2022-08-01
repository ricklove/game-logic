import { Char, Int32, ValueTypes, Vector2 } from "@local/core/lib/src/types";
import { Tile, TileGrid } from "./types";

export type AllowedSet = Int32[];
export type LevelPart = TileGrid & {
    index: Int32;
    key: string,
    isEdgeBottom: boolean;
    isEdgeTop___: boolean;
    isEdgeLeft__: boolean;
    isEdgeRight_: boolean;
    symbolsBottom: string,
    symbolsTop___: string,
    symbolsLeft__: string,
    symbolsRight_: string,
    allowedBottom: AllowedSet,
    allowedTop___: AllowedSet,
    allowedLeft__: AllowedSet,
    allowedRight_: AllowedSet,
};

export const extractLevelParts = (levelPartsSource: string, options?: { partSize?: Vector2, overlap?: number, mirror?: boolean }): LevelPart[] => {
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
        overlap = 1,
        mirror = true,
    } = options ?? {};

    const lines = levelPartsSource.split('\n')
        .map(x => x.trim()).filter(x => x)
        .reverse();

    const maxLineLength = Math.max(...lines.map(x => x.length));

    const parts: LevelPart[] = [...new Array(lines.length - partSize.y + 1)].flatMap((_, yBot) => {

        return [...new Array(maxLineLength - partSize.x + 1)].map((_, xLeft) => {
            const tiles: TileGrid['tiles'] = [...new Array(partSize.y)].map((_, py) => {
                return [...new Array(partSize.x)].map((_, px) => {

                    const tx = ValueTypes.Int32(xLeft + px);
                    const ty = ValueTypes.Int32(yBot + py);

                    const tile: Tile = {
                        position: ValueTypes.Vector2({ x: tx, y: ty }),
                        symbol: ValueTypes.Char(lines[ty].substring(tx, tx + 1)),
                    };
                    return tile;
                })
            });
            const part: LevelPart = {
                index: ValueTypes.Int32(0),
                key: tiles.map(rows => rows.map(r => r.symbol).join('')).join('\n'),
                size: partSize,
                tiles,
                isEdgeBottom: yBot === 0,
                isEdgeTop___: yBot + partSize.y === lines.length,
                isEdgeLeft__: xLeft === 0,
                isEdgeRight_: xLeft + partSize.x === maxLineLength,
                symbolsBottom: '',
                symbolsTop___: '',
                symbolsLeft__: '',
                symbolsRight_: '',
                allowedBottom: [],
                allowedTop___: [],
                allowedLeft__: [],
                allowedRight_: [],
            };

            if (part.key.length < partSize.x * partSize.y) {
                return undefined;
            }

            return part;
        }).filter(x => x).map(x => x!);
    });

    const levelParts = [...new Map(parts.map(x => [x.key, x])).values()];

    levelParts.forEach((part, i) => {
        const t = partSize.y - 1;
        const r = partSize.x - 1;

        part.index = ValueTypes.Int32(i);

        part.symbolsBottom = part.tiles.filter((row, ry) => ry < 0 + (overlap)).map(row => row.map(col => col.symbol).join('')).reverse().join('\n');
        part.symbolsTop___ = part.tiles.filter((row, ry) => ry > t - (overlap)).map(row => row.map(col => col.symbol).join('')).reverse().join('\n');
        part.symbolsLeft__ = part.tiles.map(row => row.filter((col, cx) => cx < 0 + (overlap)).map(col => col.symbol).join('')).reverse().join('\n');
        part.symbolsRight_ = part.tiles.map(row => row.filter((col, cx) => cx > r - (overlap)).map(col => col.symbol).join('')).reverse().join('\n');
    });

    levelParts.forEach(part => {
        part.allowedBottom = part.isEdgeBottom ? [] : levelParts.filter(p => part.symbolsBottom === p.symbolsTop___).map(p => ValueTypes.Int32(p.index));
        part.allowedTop___ = part.isEdgeTop___ ? [] : levelParts.filter(p => part.symbolsTop___ === p.symbolsBottom).map(p => ValueTypes.Int32(p.index));
        part.allowedLeft__ = part.isEdgeLeft__ ? [] : levelParts.filter(p => part.symbolsLeft__ === p.symbolsRight_).map(p => ValueTypes.Int32(p.index));
        part.allowedRight_ = part.isEdgeRight_ ? [] : levelParts.filter(p => part.symbolsRight_ === p.symbolsLeft__).map(p => ValueTypes.Int32(p.index));
    });

    return levelParts;
};