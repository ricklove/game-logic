import { Int32, ValueTypes } from "./types";

export const createRandomizer = (seedSource: string) => {
    const rando = createRandomGenerator(seedSource);
    const result = {
        random: () => ValueTypes.Float32(rando.random()),
        randomInt: (minInclusive: Int32, maxExclusive: Int32) =>
            ValueTypes.Int32(Math.floor(rando.random() * maxExclusive - minInclusive) + minInclusive),
        randomIndex: <T>(items: T[]) =>
            ValueTypes.Int32(Math.floor(rando.random() * items.length)),
        randomItem: <T>(items: T[]) =>
            items[ValueTypes.Int32(Math.floor(rando.random() * items.length))],
    };
    return result;
};
export type Randomizer = ReturnType<typeof createRandomizer>;

// FROM: https://stackoverflow.com/a/47593316/567524

function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }

    return () => {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function mulberry32(a: number) {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

const createRandomGenerator = (seedSource: string) => {
    const seed = xmur3(seedSource)();
    return {
        random: mulberry32(seed),
    };
};

