import { Int32, ValueTypes } from "./types";

const WORD_SIZE = 32;

const createBitField = (size: number, initialBitValue = false) => {

    const words = new Uint32Array(Math.ceil(size / WORD_SIZE));
    if (initialBitValue) {
        for (let i = 0; i < words.length; i++) {
            let v = 0;
            const bitsToSet = i === words.length - 1 ? size % 32 : 32;
            for (let iBit = 0; iBit < bitsToSet; iBit++) {
                v = v << 1;
                v += 1;
            }
        }
    }

    return {
        size,
        words,
    };
};

const union = (a: BitField, b: BitField): BitField => {
    const result = createBitField(a.size);
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        result.words[iWord] = a.words[iWord] | b.words[iWord];
    }
    return result;
};
const intersect = (a: BitField, b: BitField): BitField => {
    const result = createBitField(a.size);
    for (let iWord = 0; iWord < a.words.length; iWord++) {
        result.words[iWord] = a.words[iWord] & b.words[iWord];
    }
    return result;
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
const getBit = (a: BitField, i: Int32): boolean => {
    const iWord = (i / WORD_SIZE) | 0;
    const bit = i % WORD_SIZE;
    return (a.words[iWord] & (1 << bit)) !== 0;
};
const setBit = (a: BitField, i: Int32, value: boolean): void => {
    const iWord = (i / WORD_SIZE) | 0;
    const bit = i % WORD_SIZE;
    if (value) {
        a.words[iWord] |= 1 << bit;
    } else {
        a.words[iWord] &= ~(1 << bit);
    }
};

export type BitField = ReturnType<typeof createBitField>;

export const BitField = {
    create: createBitField,
    intersect,
    union,
    hasOneTrueBit,
    indexOfTrueBit: indexOfFirstTrueBit,
    getBit,
    setBit,
};