import { Int32, ValueTypes } from "./types";

type MutableProperties = "copyWithin" | "fill" | "reverse" | "set" | "sort";
export interface ReadonlyUint32Array extends Omit<Uint32Array, MutableProperties> {
    readonly [n: number]: number;
}

const WORD_SIZE = 32;

const createBitField = (size: Int32, indexOfTrueBits?: Int32[]) => {

    const words = new Uint32Array(Math.ceil(size / WORD_SIZE));
    if (indexOfTrueBits) {
        for (let iWord = 0; iWord < words.length; iWord++) {
            let v = 0;
            const bitsToSet = iWord === words.length - 1 ? size % 32 : 32;
            for (let iBit = 0; iBit < bitsToSet; iBit++) {
                v = v << indexOfTrueBits[iWord * WORD_SIZE + iBit];
                v += 1;
            }
        }
    };

    return {
        size,
        words,
    } as const;
};
const createBitFieldReadOnly = createBitField as (size: Int32, indexOfTrueBits?: Int32[]) => {
    readonly size: Int32,
    readonly words: ReadonlyUint32Array,
};

const equals = (a: BitField, b: BitField): boolean => {
    const result = createBitField(a.size);
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        if (a.words[iWord] !== b.words[iWord]) {
            return false;
        }
    }
    return true;
};
const union = (a: BitField, b: BitField): BitField => {
    const result = createBitField(a.size);
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        result.words[iWord] = a.words[iWord] | b.words[iWord];
    }
    return result;
};
const intersection = (a: BitField, b: BitField): BitField => {
    const result = createBitField(a.size);
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        result.words[iWord] = a.words[iWord] & b.words[iWord];
    }
    return result;
};
const isZero = (a: BitField): boolean => {
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        const word = a.words[iWord];
        if (word) { return false; }
    }
    return true;
};
const hasOneTrueBit = (a: BitField): boolean => {
    let trueBitCount = 0;
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        const word = a.words[iWord];
        // Skip 0
        if (!word) { continue; }

        // Check for 1 bit:

        // 1bit : 0100
        // - 1  : 0011
        // & =  : 0000 === 0

        // !1bit : 0110
        //  - 1  : 0010
        //  & =  : 0010 !== 0
        const isZeroOr1Bit = word & (word - 1);
        if (!isZeroOr1Bit) {
            // has more than 1 bit
            return false;
        }

        trueBitCount++;

        if (trueBitCount > 1) {
            // has more than 1 bit
            return false;
        }
    }

    return trueBitCount === 1;
};
const indexOfFirstTrueBit = (a: BitField): undefined | Int32 => {
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        let word = a.words[iWord];
        // Skip 0
        if (!word) { continue; }

        let iBitInWord = 0;
        while (word) {
            if (word & 1) { return ValueTypes.Int32(iWord * WORD_SIZE + iBitInWord); }
            word = word >> 1;
            iBitInWord++;
        }
    }

    return undefined;
};
const indexOfTrueBits = (a: BitField): Int32[] => {
    const indexes = [] as Int32[];
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        let word = a.words[iWord];
        // Skip 0
        if (!word) { continue; }

        let iBitInWord = 0;
        while (word) {
            if (word & 1) {
                indexes.push(ValueTypes.Int32(iWord * WORD_SIZE + iBitInWord));
            }
            word = word >> 1;
            iBitInWord++;
        }
    }

    return indexes;
};
const getBit = (a: BitField, i: Int32): boolean => {
    const iWord = (i / WORD_SIZE) | 0;
    const bit = i % WORD_SIZE;
    return (a.words[iWord] & (1 << bit)) !== 0;
};
// const setBit = (a: BitField, i: Int32, value: boolean): void => {
//     const iWord = (i / WORD_SIZE) | 0;
//     const bit = i % WORD_SIZE;
//     if (value) {
//         a.words[iWord] |= 1 << bit;
//     } else {
//         a.words[iWord] &= ~(1 << bit);
//     }
// };

export type BitField = ReturnType<typeof createBitFieldReadOnly>;

export const BitField = {
    empty: createBitFieldReadOnly(ValueTypes.Int32(0)),
    create: createBitFieldReadOnly,
    equals,
    union,
    intersection,
    isZero,
    hasOneTrueBit,
    indexOfFirstTrueBit,
    indexOfTrueBits,
    getBit,
    // setBit,
};