import { Fragment, useEffect, useState } from 'react';
import { createRandomizer } from '@local/core';

const { randomItem, shuffle } = createRandomizer(`${Date.now()}`);

const normalizeAnswer = (text: string) => {
    return text
        .replace(/[^A-Za-z0-9]/g, ``)
        .toLowerCase()
        ;
};

export const WatchPage = () => {

    const phrase = `In the beginning, God created the heavens and the earth. Genesis 1: 1`;
    const parts = phrase.split(` `);

    const [partIndex, setPartIndex] = useState(0);
    const [options, setOptions] = useState([] as {
        text: string;
        isMarkedWrong: boolean;
    }[]);

    useEffect(() => {
        nextQuestion(0);
    }, []);

    const nextQuestion = (nextPartIndex: number) => {
        setPartIndex(nextPartIndex);

        const nextPart = parts[nextPartIndex];
        if (!nextPart) {
            setOptions([]);
            return;
        }

        const wrongOptions = [... new Set(
            [...new Array(8).keys()].map(x => randomItem(parts))
                .filter(x => normalizeAnswer(x) !== normalizeAnswer(nextPart)),
        )];

        const options = shuffle([nextPart, ...wrongOptions.slice(0, 3)]);
        setOptions(options.map(x => ({
            isMarkedWrong: false,
            text: normalizeAnswer(x),
        })));
    };

    const answer = (value: typeof options[number]) => {
        const isNext = normalizeAnswer(parts[partIndex]).startsWith(normalizeAnswer(value.text));

        if (!isNext) {
            value.isMarkedWrong = true;
            setOptions(s => s.map(x => ({ ...x })));
            return;
        }

        nextQuestion(partIndex + 1);
    };

    const completed = parts.slice(0, partIndex).join(` `);
    const isDone = partIndex >= parts.length;

    return (
        <>
            <div className='bg-black text-white w-[100vw] h-[100vh]'>
                <div className='mb-2'>{completed}{!isDone ? ` ___` : ``}</div>
                {!isDone && (
                    <div key={completed}>
                    <div className='flex flex-row flex-wrap justify-center items-center'>

                            {options.map(x => (
                                <Fragment key={x.text}>
                                    <button
                                        className={`m-1 p-1 min-w-[60px] min-h-[24px] 
                                        ${x.isMarkedWrong ? `bg-red-400` : `bg-slate-700 active:bg-slate-600`}
                                    `}
                                        disabled={x.isMarkedWrong}
                                        onClick={() => answer(x)}>{x.text}</button>
                                </Fragment>
                            ))}
                    </div>
                </div>
                )}
                {isDone && (
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => nextQuestion(0)}>Next</button>
                )}
            </div>
        </>
    );
};
