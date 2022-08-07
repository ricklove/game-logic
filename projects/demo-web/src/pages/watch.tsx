import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createRandomizer } from '@local/core';

const { randomItem, shuffle } = createRandomizer(`${Date.now()}`);

type Mode = 'whole' | 'letter';
const normalizeAnswer = (text: string, mode: Mode) => {
    const t = (text || ``)
        .replace(/[^A-Za-z0-9]/g, ``)
        .toLowerCase()
        ;

    if (mode === `letter`) {
        return t.substring(0, 1);
    }

    return t;
};

export const WatchPage = () => {
    return (
        <MemoryQuestionsView />
    );
};


const getProblems = () => {

    const verses = `
    Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful. :: 1 Corinthians 13:4-5
    Jesus Christ is the same yesterday and today and forever. :: Hebrews 13:8
    Seek the LORD and his strength; seek his presence continually! :: 1 Chronicles 16:11
    Rejoice always :: 1 Thessalonians 5:16
    When I am afraid, I put my trust in you. :: Psalm 56:3
    Trust in the LORD, and do good; dwell in the land and befriend faithfulness :: Psalm 37:3
    `;

    const problemsFromVerses = verses
        .split(`\n`)
        .filter(x => x)
        .map(x => {
            const [v, r] = x.split(`::`)
                .map(x => x.trim())
                ;
            return ({
                verse: v,
                reference: r,
            });
        })
        .filter(x => x.verse && x.reference)
        .map(x => ({
            phrase: `${x.reference} - ${x.verse}`,
            name: x.reference,
        }))
        ;
    const problems = [
        ...problemsFromVerses.map(x => ({
            name: `Words - ${x.name}`,
            mode: `whole` as Mode,
            phrase: x.phrase,
        })),
        ...problemsFromVerses.map(x => ({
            name: `1st Letter - ${x.name}`,
            mode: `letter` as Mode,
            phrase: x.phrase,
        })),
    ];

    console.log(`problems`, problems);

    return problems;
};


const MemoryQuestionsView = () => {
    const problems = useMemo(() => getProblems(), []);

    const [showMenu, setShowMenu] = useState(false);

    const [problemIndex, setProblemIndex] = useState(0);
    const nextProblem = () => {
        setProblemIndex(s => {
            if (problemIndex + 1 >= problems.length) {
                return 0;
            }
            return s + 1;
        });
    };

    const problem = problems[problemIndex];

    return (
        <div>
            <div className='flex flex-row'>
                <div className='flex-1' />
                <button
                    className={`m-1 min-w-[16px] min-h-[16px] bg-blue-400 active:bg-blue-600`}
                    onClick={() => setShowMenu(s => !s)}>ℹ</button>
            </div>
            {showMenu && (
                <MemoryQuestionMenu
                    problems={problems}
                    onChangeProblem={x => { setProblemIndex(x); setShowMenu(false); }}
                />
            )}
            {!showMenu && (
                <MemoryQuestionView
                    phrase={problem.phrase}
                    mode={problem.mode}
                    onDone={() => nextProblem()}
                />
            )}
        </div>
    );
};

const MemoryQuestionMenu = ({
    problems,
    onChangeProblem,
}: {
    problems: readonly { name: string }[];
    onChangeProblem: (problemIndex: number) => void;
}) => {
    return (
        <>
            {problems.map((x, i) => (
                <Fragment key={i}>
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => onChangeProblem(i)}>{x.name}</button>
                </Fragment>
            ))}
        </>
    );
};

const MemoryQuestionView = ({
    phrase,
    mode,
    onDone,
}: {
    phrase: string;
    mode: Mode;
    onDone: () => void;
}) => {

    const partsRef = useRef([] as string[]);

    const [partIndex, setPartIndex] = useState(0);
    const [options, setOptions] = useState([] as {
        text: string;
        isMarkedWrong: boolean;
    }[]);

    useEffect(() => {
        const parts = phrase
            .replace(/(\d+)/g, ` $1 `)
            .split(` `)
            .filter(x => x)
            ;

        console.log(`parts`, { parts });
        partsRef.current = parts;

        nextQuestion(0);
    }, [phrase, mode]);

    const nextQuestion = (nextPartIndex: number) => {

        const parts = partsRef.current;
        let nextPart = parts[nextPartIndex];
        while (!normalizeAnswer(nextPart, mode)
            && nextPartIndex < parts.length
        ) {
            nextPartIndex++;
            nextPart = parts[nextPartIndex];
        }

        setPartIndex(nextPartIndex);

        if (!nextPart) {
            setOptions([]);
            return;
        }

        const wrongOptions = [... new Set(
            [...new Array(8).keys()].map(x => randomItem(parts))
                .filter(x => normalizeAnswer(x, mode))
                .filter(x => normalizeAnswer(x, mode) !== normalizeAnswer(nextPart, mode)),
        )];

        const options = shuffle([nextPart, ...wrongOptions.slice(0, 3)]);
        setOptions(options.map(x => ({
            isMarkedWrong: false,
            text: normalizeAnswer(x, mode),
        })));
    };

    const answer = (value: typeof options[number]) => {
        const parts = partsRef.current;
        const isNext = normalizeAnswer(parts[partIndex], mode).startsWith(normalizeAnswer(value.text, mode));

        if (!isNext) {
            value.isMarkedWrong = true;
            setOptions(s => s.map(x => ({ ...x })));
            return;
        }

        nextQuestion(partIndex + 1);
    };

    const parts = partsRef.current;
    const completed = parts.slice(0, partIndex).join(` `);
    const isDone = partIndex >= parts.length;

    return (
        <>
            <div className='bg-black text-white w-[100vw] min-h-[100vh]'>
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
                        onClick={() => onDone()}>Next</button>
                )}

                <div className='h-[25vh]' />
            </div>
        </>
    );
};
