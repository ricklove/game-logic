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
    const collapseSurroundingTiles_recursive = (tile: undefined | WaveFormCollapseTile, allowedPartIndexes: number[], visited: WaveFormCollapseTile[], from?: undefined | WaveFormCollapseTile) => {
        iterations++;
        if (options?.maxSteps && iterations >= options.maxSteps) { return; }

        if (!tile || tile.part) { return; }
        // if (visited.includes(tile)) { return; }
        visited.push(tile);

        const oldPossiblePartIndexes = tile.possiblePartIndexes;
        tile.possiblePartIndexes = tile.possiblePartIndexes.filter(i => allowedPartIndexes.includes(i));

        // TODO: 233 is correct, how did it change to 232?
        console.log('collapseSurroundingTiles_recursive', { iterations, ...tile?.position, fromPos: from?.position, tile, oldPossiblePartIndexes, possiblePartIndexes: tile.possiblePartIndexes, allowedPartIndexes, visited, from });

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

        const b = levelGen.tiles[position.y - 1]?.[position.x + 0];
        const t = levelGen.tiles[position.y + 1]?.[position.x + 0];
        const l = levelGen.tiles[position.y + 0]?.[position.x - 1];
        const r = levelGen.tiles[position.y + 0]?.[position.x + 1];

        collapseSurroundingTiles_recursive(b, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedBottom), visited, tile);
        collapseSurroundingTiles_recursive(t, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedTop___), visited, tile);
        collapseSurroundingTiles_recursive(l, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedLeft__), visited, tile);
        collapseSurroundingTiles_recursive(r, tile.possiblePartIndexes.flatMap(iPart => levelParts[iPart].allowedRight_), visited, tile);
    };


    let remainingTiles = levelGen.tiles.flatMap(x => x);

    // Set the corner/border tiles to enforce edges
    const blCorners = levelParts.filter(x => x.isEdgeBottom && x.isEdgeLeft__).map(x => x.index);
    const tlCorners = levelParts.filter(x => x.isEdgeTop___ && x.isEdgeLeft__).map(x => x.index);
    const brCorners = levelParts.filter(x => x.isEdgeBottom && x.isEdgeRight_).map(x => x.index);
    const trCorners = levelParts.filter(x => x.isEdgeTop___ && x.isEdgeRight_).map(x => x.index);
    // if (blCorners) { collapseSurroundingTiles_recursive(levelGen.tiles[0][0], blCorners, []); }
    // if (tlCorners) { collapseSurroundingTiles_recursive(levelGen.tiles[levelGenSize.y - 1][0], tlCorners, []); }
    // if (brCorners) { collapseSurroundingTiles_recursive(levelGen.tiles[0][levelGenSize.x - 1], brCorners, []); }
    if (trCorners) { collapseSurroundingTiles_recursive(levelGen.tiles[levelGenSize.y - 1][levelGenSize.x - 1], trCorners, []); }

    // TEMP Skip next
    remainingTiles = [];


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

