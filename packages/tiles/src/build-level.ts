import { createRandomizer, Int32, Randomizer, ValueTypes, Vector2 } from "@local/core";
import { extractLevelParts, LevelPart } from "./level-parts";
import { createTileGrid } from "./tile-grid";
import { Tile } from "./types";

export const buildLevel = (levelPartsSource: string, levelSize: Vector2, options?: { partSize?: Vector2, randomizer?: Randomizer, maxSteps?: number }) => {
    // Use wave form collapse
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
        randomizer = createRandomizer(`${Math.random()}`),
    } = options ?? {};

    const levelParts = extractLevelParts(levelPartsSource, { partSize }).map(x => ({
        ...x,
    }));

    type WaveFormLevelPart = typeof levelParts[number];



    type WaveFormCollapseTile = Tile & {
        possiblePartIndexes: Int32[],
        part: undefined | WaveFormLevelPart;
    };

    const levelGenSize = ValueTypes.Vector2({
        x: Math.ceil((levelSize.x - 1) / (partSize.x - 1)),
        y: Math.ceil((levelSize.y - 1) / (partSize.y - 1)),
    })
    const levelGen = createTileGrid<WaveFormCollapseTile>(levelGenSize, pos => ({
        symbol: ValueTypes.Char('.'),
        position: pos,
        possiblePartIndexes: [...new Array(levelParts.length)].map((_, iPart) => ValueTypes.Int32(iPart)),
        part: undefined,
    }));

    let iterations = 0;
    const changedTiles = [] as WaveFormCollapseTile[];

    const collapseTile = (tile: undefined | WaveFormCollapseTile, allowedPartIndexes: number[]) => {

        if (!tile || tile.part) { return; }

        const oldPossiblePartIndexes = tile.possiblePartIndexes;
        tile.possiblePartIndexes = tile.possiblePartIndexes.filter(i => allowedPartIndexes.includes(i));

        // TODO: 233 is correct, how did it change to 232?
        console.log('collapseTile', { iterations, ...tile?.position, tile, oldPossiblePartIndexes, possiblePartIndexes: tile.possiblePartIndexes, allowedPartIndexes });

        if (oldPossiblePartIndexes.length === tile.possiblePartIndexes.length) {
            // No change
            return;
        }

        if (tile.possiblePartIndexes.length === 1) {
            const iPart = tile.possiblePartIndexes[0];
            tile.part = levelParts[iPart];

            console.log('collapseTile: part set', { iPart, tile });
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

        changedTiles.push(tile);
    };

    const expandFromChangedTile = (tile: WaveFormCollapseTile) => {
        console.log('expandFromChangedTile', { iterations, ...tile?.position, tile });

        const { position } = tile;

        const b = levelGen.tiles[position.y - 1]?.[position.x + 0];
        const t = levelGen.tiles[position.y + 1]?.[position.x + 0];
        const l = levelGen.tiles[position.y + 0]?.[position.x - 1];
        const r = levelGen.tiles[position.y + 0]?.[position.x + 1];

        collapseTile(b, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedBottom));
        collapseTile(t, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedTop___));
        collapseTile(l, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedLeft__));
        collapseTile(r, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedRight_));
    };

    const processChangedTiles = () => {
        for (const t of changedTiles) {
            expandFromChangedTile(t);
        }
        changedTiles.splice(0, changedTiles.length);
    };


    let remainingTiles = levelGen.tiles.flatMap(x => x);

    // Set the corner/border tiles to enforce edges
    const blCorners = levelParts.filter(x => x.isEdgeBottom && x.isEdgeLeft__).map(x => x.index);
    const tlCorners = levelParts.filter(x => x.isEdgeTop___ && x.isEdgeLeft__).map(x => x.index);
    const brCorners = levelParts.filter(x => x.isEdgeBottom && x.isEdgeRight_).map(x => x.index);
    const trCorners = levelParts.filter(x => x.isEdgeTop___ && x.isEdgeRight_).map(x => x.index);
    if (blCorners) { collapseTile(levelGen.tiles[0][0], blCorners); }
    if (tlCorners) { collapseTile(levelGen.tiles[levelGenSize.y - 1][0], tlCorners); }
    if (brCorners) { collapseTile(levelGen.tiles[0][levelGenSize.x - 1], brCorners); }
    if (trCorners) { collapseTile(levelGen.tiles[levelGenSize.y - 1][levelGenSize.x - 1], trCorners); }

    processChangedTiles();

    // TEMP Skip next
    // remainingTiles = [];

    while (remainingTiles.length) {
        iterations++;
        if (options?.maxSteps && iterations >= options.maxSteps) { break; }

        const minLength = Math.min(...remainingTiles.map(x => x.possiblePartIndexes.length));
        const lowEntropyTiles = remainingTiles.filter(x => x.possiblePartIndexes.length === minLength);
        const nextTile = randomizer.randomItem(lowEntropyTiles);
        const partIndex = randomizer.randomItem(nextTile.possiblePartIndexes);

        collapseTile(nextTile, [partIndex]);
        processChangedTiles();

        if (remainingTiles.some(x => !x.possiblePartIndexes.length)) {
            // Contradiction!
            break;
        }

        remainingTiles = remainingTiles.filter(x => !x.part);
    }

    const debug = false;
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

    return { level, levelGen, levelParts };
};

