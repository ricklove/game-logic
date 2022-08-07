export type Int32 = number & { _type: 'Int32' };
export type Float32 = number & { _type: 'Float32' };
export type Char = string & { _type: 'Char' };

export type Vector2 = {
    y: Int32;
    x: Int32;
} & { _type: 'Vector2' };

export const ValueTypes = {
    Float32: (value: number) => {
        if (!Number.isFinite(value)) {
            throw new Error(`Not an Finite Number`);
        }
        return value as Float32;
    },
    Int32: (value: number) => {
        if (!Number.isInteger(value)) {
            throw new Error(`Not an Int32`);
        }
        return value as Int32;
    },
    Char: (value: string) => {
        if (value.length !== 1) {
            throw new Error(`Not an Char`);
        }
        return value as Char;
    },
    Vector2: ({ y, x }: { y: number; x: number }) => {
        return { y: ValueTypes.Int32(y), x: ValueTypes.Int32(x) } as Vector2;
    },
};
