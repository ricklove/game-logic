import { BitField, createRandomizer, delay, Int32, Randomizer, ValueTypes, Vector2 } from "@local/core";
import { extractLevelParts, LevelPart } from "./level-parts";
import { createTileGrid } from "./tile-grid";
import { Tile, TileGrid } from "./types";

type WaveFormCollapseTile = Tile & {
    possiblePartBitField: BitField,
    possiblePartIndexes: Int32[],
    part: undefined | LevelPart;
};
export type BuildLevelResult = {
    level: TileGrid<Tile>,
    levelAsParts?: TileGrid<Tile>,
    levelGen?: TileGrid<WaveFormCollapseTile>,
    levelParts?: LevelPart[],
};
export const buildLevel = async (levelPartsSource: string, levelSize: Vector2, options?: { partSize?: Vector2, overlap?: number, randomizer?: Randomizer, maxSteps?: number, onProgress?: (partial: BuildLevelResult) => void }): Promise<BuildLevelResult> => {
    // Use wave form collapse
    const {
        partSize = ValueTypes.Vector2({ x: 3, y: 3 }),
        overlap = 2,
        randomizer = createRandomizer(`${Math.random()}`),
    } = options ?? {};

    const levelParts = extractLevelParts(levelPartsSource, { partSize, overlap }).map(x => ({
        ...x,
    }));

    const levelGenSize = ValueTypes.Vector2({
        x: Math.ceil((levelSize.x - overlap) / (partSize.x - overlap)),
        y: Math.ceil((levelSize.y - overlap) / (partSize.y - overlap)),
    })
    const allPartIndexes = [...new Array(levelParts.length)].map((_, iPart) => ValueTypes.Int32(iPart));
    const levelGen = createTileGrid<WaveFormCollapseTile>(levelGenSize, pos => ({
        symbol: ValueTypes.Char('.'),
        position: pos,
        possiblePartBitField: BitField.create(ValueTypes.Int32(allPartIndexes.length), allPartIndexes),
        possiblePartIndexes: [...allPartIndexes],
        part: undefined,
    }));

    const getResult = () => {

        const getLevelAsParts = () => {
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
            return level;
        };

        const getLevel = () => {
            // Overlap the parts to create the level
            const actualLevelSize = ValueTypes.Vector2({
                x: levelGen.size.x * (partSize.x - overlap) + overlap,
                y: levelGen.size.y * (partSize.y - overlap) + overlap,
            });

            const level = createTileGrid<Tile>(actualLevelSize, pos => {
                const tyRaw = Math.floor(pos.y / (partSize.y - overlap));
                const ty = tyRaw >= levelGen.size.y ? levelGen.size.y - 1
                    : tyRaw;
                const py = tyRaw >= levelGen.size.y ? partSize.y - (actualLevelSize.y - pos.y)
                    : pos.y % (partSize.y - overlap);

                const txRaw = Math.floor(pos.x / (partSize.x - overlap));
                const tx = txRaw >= levelGen.size.x ? levelGen.size.x - 1
                    : txRaw;
                const px = txRaw >= levelGen.size.x ? partSize.x - (actualLevelSize.x - pos.x)
                    : pos.x % (partSize.x - overlap);

                const part = levelGen.tiles[ty]?.[tx]?.part;

                return {
                    symbol: part?.tiles[py][px].symbol ?? ValueTypes.Char(' '),
                    position: pos,
                }
            });

            return level;
        };

        return {
            level: getLevel(),
            levelAsParts: getLevelAsParts(),
            levelGen,
            levelParts,
        };
    };

    let iterations_loop = 0;
    let iterations_collapseTile = 0;
    let iterations_expandFromChangedTile = 0;
    let iterations_processChangedTiles = 0;

    let lastProgressTime = Date.now();
    const TIME_PROGRESS_MS = 1000;
    const sendProgress = async (isDone = false) => {
        if (!isDone && Date.now() < lastProgressTime + TIME_PROGRESS_MS) { return; }
        lastProgressTime = Date.now();

        console.log('sendProgress', {
            iterations_loop,
            iterations_collapseTile,
            iterations_expandFromChangedTile,
            iterations_processChangedTiles,
        });
        options?.onProgress?.(getResult());
        await delay(1);
    };


    const changedTiles = [] as WaveFormCollapseTile[];

    // const intersection = <T extends string | number>(a: T[], b: T[]): T[] => {
    //     const set = new Set(b);
    //     return a.filter(x => set.has(x));
    // };
    // const intersection = (a: Int32[], b: AllowedSet) => {
    //     const sets = new Set(b.flatMap(x => x));
    //     return a.filter(x => sets.has(x));
    //     // return a.filter(x => b.some(s => s.has(x)));
    // };
    // const union = (b: AllowedSet[]): AllowedSet => {
    //     return b.flatMap(x => x);
    // };
    const intersection = (a: BitField, b: BitField) => {
        return BitField.intersection(a, b);
    };
    const union = (sets: BitField[]): BitField => {
        if (sets.length === 1) {
            return sets[0];
        }
        if (sets.length === 2) {
            return BitField.union(sets[0], sets[1]);
        }
        let u = sets[0];
        for (const s of sets) {
            if (u === s) { continue; }
            u = BitField.union(u, s);
        }
        return u;
    };

    const collapseTile = (tile: undefined | WaveFormCollapseTile, allowedPartIndexes: BitField) => {
        iterations_collapseTile++;

        if (!tile || tile.part) { return; }

        const oldPossiblePartBitField = tile.possiblePartBitField;
        tile.possiblePartBitField = intersection(tile.possiblePartBitField, allowedPartIndexes);

        // TODO: 233 is correct, how did it change to 232?
        // console.log('collapseTile', { iterations, ...tile?.position, tile, oldPossiblePartIndexes, possiblePartIndexes: tile.possiblePartIndexes, allowedPartIndexes });

        if (BitField.equals(oldPossiblePartBitField, tile.possiblePartBitField)) {
            // No change
            return;
        }

        if (BitField.hasOneTrueBit(tile.possiblePartBitField)) {
            const iPart = BitField.indexOfFirstTrueBit(tile.possiblePartBitField);
            tile.part = levelParts[iPart!];

            console.log('collapseTile: part set', { iPart, tile });
        }

        if (BitField.isZero(tile.possiblePartBitField)) {
            console.error('No possible part available', {
                tile,
                oldPossiblePartBitField,
                allowedPartIndexes,
            });
            // tile.part = levelParts[allowedPartIndexes[0]];
            return;
        }

        tile.possiblePartIndexes = BitField.indexOfTrueBits(tile.possiblePartBitField);
        changedTiles.push(tile);
    };

    const expandFromChangedTile = (tile: WaveFormCollapseTile) => {
        iterations_expandFromChangedTile++;

        // console.log('expandFromChangedTile', { iterations, ...tile?.position, tile });

        const { position } = tile;

        const b = levelGen.tiles[position.y - 1]?.[position.x + 0];
        const t = levelGen.tiles[position.y + 1]?.[position.x + 0];
        const l = levelGen.tiles[position.y + 0]?.[position.x - 1];
        const r = levelGen.tiles[position.y + 0]?.[position.x + 1];

        collapseTile(b, union(tile.possiblePartIndexes.map(iPart => levelParts[iPart].allowedBottom)));
        collapseTile(t, union(tile.possiblePartIndexes.map(iPart => levelParts[iPart].allowedTop___)));
        collapseTile(l, union(tile.possiblePartIndexes.map(iPart => levelParts[iPart].allowedLeft__)));
        collapseTile(r, union(tile.possiblePartIndexes.map(iPart => levelParts[iPart].allowedRight_)));
    };

    const processChangedTiles = async () => {
        iterations_processChangedTiles++;

        for (const t of changedTiles) {
            await sendProgress();
            expandFromChangedTile(t);
        }
        changedTiles.splice(0, changedTiles.length);
    };


    let remainingTiles = levelGen.tiles.flatMap(x => x);

    // Set the corner/border tiles to enforce edges
    const blCorners = BitField.create(ValueTypes.Int32(levelParts.length), levelParts.filter(x => x.isEdgeBottom && x.isEdgeLeft__).map(x => x.index));
    const tlCorners = BitField.create(ValueTypes.Int32(levelParts.length), levelParts.filter(x => x.isEdgeTop___ && x.isEdgeLeft__).map(x => x.index));
    const brCorners = BitField.create(ValueTypes.Int32(levelParts.length), levelParts.filter(x => x.isEdgeBottom && x.isEdgeRight_).map(x => x.index));
    const trCorners = BitField.create(ValueTypes.Int32(levelParts.length), levelParts.filter(x => x.isEdgeTop___ && x.isEdgeRight_).map(x => x.index));
    if (blCorners) { collapseTile(levelGen.tiles[0][0], blCorners); }
    if (tlCorners) { collapseTile(levelGen.tiles[levelGenSize.y - 1][0], tlCorners); }
    if (brCorners) { collapseTile(levelGen.tiles[0][levelGenSize.x - 1], brCorners); }
    if (trCorners) { collapseTile(levelGen.tiles[levelGenSize.y - 1][levelGenSize.x - 1], trCorners); }

    await processChangedTiles();

    // TEMP Skip next
    // remainingTiles = [];

    while (remainingTiles.length) {
        iterations_loop++;

        await sendProgress();

        if (options?.maxSteps && iterations_loop >= options.maxSteps) { break; }

        const minLength = Math.min(...remainingTiles.map(x => x.possiblePartIndexes.length));
        const lowEntropyTiles = remainingTiles.filter(x => x.possiblePartIndexes.length === minLength);
        // Pick the left bottom tile (to avoid the middle)
        const nextTile = lowEntropyTiles[0];
        //const nextTile = randomizer.randomItem(lowEntropyTiles);
        const partIndex = randomizer.randomItem(nextTile.possiblePartIndexes);

        collapseTile(nextTile, BitField.create(ValueTypes.Int32(levelParts.length), [partIndex]));
        await processChangedTiles();

        if (remainingTiles.some(x => !x.possiblePartIndexes.length)) {
            // Contradiction!
            console.error('Contradiction!', { fails: remainingTiles.filter(x => !x.possiblePartIndexes.length) });;
            break;
        }

        remainingTiles = remainingTiles.filter(x => !x.part);
    }

    await sendProgress(true);
    return getResult();
};

