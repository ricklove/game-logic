import { createRandomizer, Int32, Randomizer, ValueTypes, Vector2 } from "@local/core";
import { extractLevelParts, LevelPart } from "./level-parts";
import { createTileGrid } from "./tile-grid";
import { Tile } from "./types";

export const buildLevel = (levelPartsSource: string, levelSize: Vector2, options?: { partSize?: Vector2, randomizer?: Randomizer }) => {
    // Use wave form collapse
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
        randomizer = createRandomizer(`${Math.random()}`),
    } = options ?? {};

    const levelParts = extractLevelParts(levelPartsSource, { partSize }).map(x => ({
        ...x,
        symbolsTop___: '',
        symbolsBottom: '',
        symbolsLeft__: '',
        symbolsRight_: '',
        allowedTop___: [] as number[],
        allowedBottom: [] as number[],
        allowedLeft__: [] as number[],
        allowedRight_: [] as number[],
    }));

    type WaveFormLevelPart = typeof levelParts[number];

    levelParts.forEach(part => {
        const t = partSize.y - 1;
        const r = partSize.x - 1;

        part.symbolsTop___ = part.tiles.filter((row, ry) => ry === t).flatMap(row => row.map(col => col.symbol)).join('');
        part.symbolsBottom = part.tiles.filter((row, ry) => ry === 0).flatMap(row => row.map(col => col.symbol)).join('');
        part.symbolsLeft__ = part.tiles.flatMap(row => row.filter((col, cx) => cx === 0)).map(col => col.symbol).join('');
        part.symbolsRight_ = part.tiles.flatMap(row => row.filter((col, cx) => cx === r)).map(col => col.symbol).join('');
    });

    levelParts.forEach(part => {
        part.allowedTop___ = levelParts.map((p, i) => ({ p, i })).filter(p => part.symbolsTop___ === p.p.symbolsTop___).map(p2 => p2.i);
        part.allowedBottom = levelParts.map((p, i) => ({ p, i })).filter(p => part.symbolsBottom === p.p.symbolsBottom).map(p2 => p2.i);
        part.allowedLeft__ = levelParts.map((p, i) => ({ p, i })).filter(p => part.symbolsLeft__ === p.p.symbolsLeft__).map(p2 => p2.i);
        part.allowedRight_ = levelParts.map((p, i) => ({ p, i })).filter(p => part.symbolsRight_ === p.p.symbolsRight_).map(p2 => p2.i);
    });


    type WaveFormCollapseTile = Tile & {
        possiblePartIndexes: Int32[],
        part: undefined | WaveFormLevelPart;
    };

    const levelGen = createTileGrid<WaveFormCollapseTile>(ValueTypes.Vector2({
        x: Math.ceil((levelSize.x - 1) / (partSize.x - 1)),
        y: Math.ceil((levelSize.y - 1) / (partSize.y - 1)),
    }), pos => ({
        symbol: ValueTypes.Char('.'),
        position: pos,
        possiblePartIndexes: [...new Array(levelParts.length)].map((_, iPart) => ValueTypes.Int32(iPart)),
        part: undefined,
    }));

    const collapseSurroundingTiles_recursive = (tile: undefined | WaveFormCollapseTile, allowedPartIndexes: number[], visited: WaveFormCollapseTile[]) => {
        if (!tile || tile.part) { return; }
        if (visited.includes(tile)) { return; }
        visited.push(tile);

        const oldPossiblePartIndexes = tile.possiblePartIndexes;
        tile.possiblePartIndexes = tile.possiblePartIndexes.filter(i => allowedPartIndexes.includes(i));
        if (oldPossiblePartIndexes.length === tile.possiblePartIndexes.length) {
            // No change
            return;
        }

        if (tile.possiblePartIndexes.length === 1) {
            tile.part = levelParts[allowedPartIndexes[0]];
        }

        if (tile.possiblePartIndexes.length === 0) {
            console.error('No possible part available', {
                tile,
                oldPossiblePartIndexes,
                allowedPartIndexes,
            });
            // tile.part = levelParts[allowedPartIndexes[0]];
            return;
        }

        const { position } = tile;

        const t = levelGen.tiles[position.y + 1]?.[position.x + 0];
        const b = levelGen.tiles[position.y - 1]?.[position.x + 0];
        const r = levelGen.tiles[position.y + 0]?.[position.x + 1];
        const l = levelGen.tiles[position.y + 0]?.[position.x - 1];

        collapseSurroundingTiles_recursive(t, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedBottom), visited);
        collapseSurroundingTiles_recursive(b, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedTop___), visited);
        collapseSurroundingTiles_recursive(r, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedLeft__), visited);
        collapseSurroundingTiles_recursive(l, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedRight_), visited);
    };

    // TODO: Set the corner/border tiles to enforce edges

    let remainingTiles = levelGen.tiles.flatMap(x => x);
    while (remainingTiles.length) {
        const minLength = Math.min(...remainingTiles.map(x => x.possiblePartIndexes.length));
        const lowEntropyTiles = remainingTiles.filter(x => x.possiblePartIndexes.length === minLength);
        const nextTile = randomizer.randomItem(lowEntropyTiles);
        const partIndex = randomizer.randomItem(nextTile.possiblePartIndexes);

        collapseSurroundingTiles_recursive(nextTile, [partIndex], []);

        if (remainingTiles.some(x => !x.possiblePartIndexes.length)) {
            // Contradiction!
            break;
        }

        remainingTiles = remainingTiles.filter(x => !x.part);
    }

    const debug = true;
    if (debug) {
        // Overlap the parts to create the level
        const actualLevelSize = ValueTypes.Vector2({
            x: levelGen.size.x * (partSize.x + 1),
            y: levelGen.size.y * (partSize.y + 1),
        });

        const level = createTileGrid<Tile>(actualLevelSize, pos => {
            const ty = Math.floor(pos.y / (partSize.y + 1));
            const py = pos.y % (partSize.y + 1);
            const tx = Math.floor(pos.x / (partSize.x + 1));
            const px = pos.x % (partSize.x + 1);

            const part = levelGen.tiles[ty]?.[tx]?.part;

            return {
                symbol: part?.tiles[py]?.[px]?.symbol ?? ValueTypes.Char(' '),
                position: pos,
            }
        });

        return { level, levelGen, levelParts };
    }


    // Overlap the parts to create the level
    const actualLevelSize = ValueTypes.Vector2({
        x: levelGen.size.x * (partSize.x - 1) + 1,
        y: levelGen.size.y * (partSize.y - 1) + 1,
    });

    const level = createTileGrid<Tile>(actualLevelSize, pos => {
        const tyRaw = Math.floor(pos.y / (partSize.y - 1));
        const ty = tyRaw >= levelGen.size.y ? tyRaw - 1 : tyRaw;
        const py = tyRaw >= levelGen.size.y ? 2 : pos.y % (partSize.y - 1);
        const txRaw = Math.floor(pos.x / (partSize.x - 1));
        const tx = txRaw >= levelGen.size.x ? txRaw - 1 : txRaw;
        const px = txRaw >= levelGen.size.x ? 2 : pos.x % (partSize.x - 1);

        const part = levelGen.tiles[ty]?.[tx]?.part;

        return {
            symbol: part?.tiles[py][px].symbol ?? ValueTypes.Char(' '),
            position: pos,
        }
    });

    return { level, levelGen: undefined, levelParts: undefined };
};

