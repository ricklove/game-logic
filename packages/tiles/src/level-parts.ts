import { Char, Int32, ValueTypes, Vector2 } from "@local/core/lib/src/types";
import { Tile, TileGrid } from "./types";


export type LevelPart = TileGrid & {
    index: number;
    key: string,
    isEdgeBottom: boolean;
    isEdgeTop___: boolean;
    isEdgeLeft__: boolean;
    isEdgeRight_: boolean;
    symbolsBottom: string,
    symbolsTop___: string,
    symbolsLeft__: string,
    symbolsRight_: string,
    allowedBottom: number[],
    allowedTop___: number[],
    allowedLeft__: number[],
    allowedRight_: number[],
};

export const extractLevelParts = (levelPartsSource: string, options?: { partSize: Vector2 }): LevelPart[] => {
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
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
                index: 0,
                key: tiles.map(rows => rows.map(r => r.symbol).join('')).join(''),
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

        part.index = i;

        part.symbolsBottom = part.tiles.filter((row, ry) => ry === 0).flatMap(row => row.map(col => col.symbol)).join('');
        part.symbolsTop___ = part.tiles.filter((row, ry) => ry === t).flatMap(row => row.map(col => col.symbol)).join('');
        part.symbolsLeft__ = part.tiles.flatMap(row => row.filter((col, cx) => cx === 0)).map(col => col.symbol).join('');
        part.symbolsRight_ = part.tiles.flatMap(row => row.filter((col, cx) => cx === r)).map(col => col.symbol).join('');
    });

    levelParts.forEach(part => {
        part.allowedBottom = part.isEdgeBottom ? [] : levelParts.filter(p => part.symbolsBottom === p.symbolsTop___).map(p => p.index);
        part.allowedTop___ = part.isEdgeTop___ ? [] : levelParts.filter(p => part.symbolsTop___ === p.symbolsBottom).map(p => p.index);
        part.allowedLeft__ = part.isEdgeLeft__ ? [] : levelParts.filter(p => part.symbolsLeft__ === p.symbolsRight_).map(p => p.index);
        part.allowedRight_ = part.isEdgeRight_ ? [] : levelParts.filter(p => part.symbolsRight_ === p.symbolsLeft__).map(p => p.index);
    });

    return levelParts;
};