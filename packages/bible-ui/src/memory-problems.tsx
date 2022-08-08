import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createRandomizer, ValueTypes } from '@local/core';
import { getVerseProblems } from './verses';

const { randomItem, randomInt, shuffle } = createRandomizer(`${Date.now()}`);

type Mode = 'whole' | 'letter';
const normalizeAnswer = (text: string, mode: Mode) => {
    const t = (text || ``)
        .replace(/[^\w\d]+/g, ``)
        .toLocaleLowerCase()
        ;

    if (mode === `letter`) {
        return t.substring(0, 1);
    }

    return t;
};

const getProblems = () => {

    const problemsFromVerses = getVerseProblems();

    const subjectsRaw = [
        {
            subject: `Memory Verses - Word Answers`,
            sections: problemsFromVerses.map(s => ({
                section: s.section,
                problems: s.problems.map(x => ({
                    name: `Words - ${x.name}`,
                    mode: `whole` as Mode,
                    phrase: x.phrase,
                    prephrase: x.prephrase,
                })),
            })),
        },
        {
            subject: `Memory Verses - Letter Answers`,
            sections: problemsFromVerses.map(s => ({
                section: s.section,
                problems: s.problems.map(x => ({
                    name: `1st Letter - ${x.name}`,
                    mode: `letter` as Mode,
                    phrase: x.phrase,
                    prephrase: x.prephrase,
                })),
            })),
        },
    ];

    const subjects = subjectsRaw
        .map(sub => ({
            ...sub,
            sections: sub
                .sections.map(sec => ({
                    ...sec,
                    problems: sec
                        .problems.map(p => ({
                            ...p,
                            subject: sub.subject,
                            section: sec.section,
                        }))
                        .map(p => ({
                            ...p,
                            key: `${p.subject}::${p.section}::${p.name}`,
                        })),
                })),
        }));

    console.log(`problems`, subjects);

    return {
        subjects,
    };
};

type Subject = ReturnType<typeof getProblems>['subjects'][number];
type Section = Subject['sections'][number];
type Problem = Section['problems'][number];

export const MemoryQuestionsView = () => {
    const { subjects } = useMemo(() => getProblems(), []);
    const problems = subjects.flatMap(sub => sub.sections).flatMap(sec => sec.problems);

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
                    subjects={subjects}
                    onChangeProblem={x => {
                        setProblemIndex(problems.findIndex(p => p.key === x));
                        setShowMenu(false);
                    }}
                />
            )}
            {!showMenu && (
                <MemoryQuestionView
                    problem={problem}
                    onDone={() => nextProblem()}
                />
            )}
        </div>
    );
};

const MemoryQuestionMenu = ({
    subjects,
    onChangeProblem,
}: {
        subjects: Subject[];
        onChangeProblem: (problemKey: string) => void;
}) => {

    const [subject, setSubject] = useState(undefined as undefined | string);
    const [section, setSection] = useState(undefined as undefined | string);

    const sub = subjects.find(s => s.subject === subject);
    const sec = sub?.sections.find(s => s.section === section);

    return (
        <>
            {!sub && subjects.map(s => (
                <Fragment key={s.subject} >
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => setSubject(s.subject)}>{s.subject}</button>
                </Fragment>
            ))}
            {!sec && sub?.sections.map(s => (
                <Fragment key={s.section} >
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => setSection(s.section)}>{s.section}</button>
                </Fragment>
            ))}
            {sec && sec.problems.map((x, i) => (
                <Fragment key={i}>
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => onChangeProblem(x.key)}>{x.name}</button>
                </Fragment>
            ))}
        </>
    );
};


const getWrongOptions = (correctAnswer: string, choiceSource: string[], mode: Mode) => {

    const getRandomOptions = () => {
        if (Number.isInteger(Number(correctAnswer))) {
            const n = Number(correctAnswer);
            return [
                n + randomInt(ValueTypes.Int32(-4), ValueTypes.Int32(4)),
                n + randomInt(ValueTypes.Int32(-4), ValueTypes.Int32(4)),
                n + randomInt(ValueTypes.Int32(-4), ValueTypes.Int32(4)),
                n + randomInt(ValueTypes.Int32(-4), ValueTypes.Int32(4)),
                n + randomInt(ValueTypes.Int32(-10), ValueTypes.Int32(10)),
                n + randomInt(ValueTypes.Int32(-10), ValueTypes.Int32(10)),
            ].map(x => `${x}`);
        }

        return [...new Array(8).keys()]
            .map(() => randomItem(choiceSource));
    };

    return [... new Set(
        getRandomOptions()
            .filter(x => normalizeAnswer(x, mode))
            .filter(x => normalizeAnswer(x, mode) !== normalizeAnswer(correctAnswer, mode)),
    )];
};

const MemoryQuestionView = ({
    problem,
    onDone,
}: {
        problem: Problem;
    onDone: () => void;
}) => {

    const {
        mode,
        phrase,
        prephrase,
    } = problem;

    const targetRef = useRef(null as null | HTMLSpanElement);
    const scrollToTarget = () => {
        setTimeout(() => {
            targetRef.current?.scrollIntoView({
                behavior: `smooth`,
            });
        }, 10);
    };

    const partsRef = useRef([] as { text: string; wasWrong?: boolean }[]);

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
        partsRef.current = parts.map(x => ({ text: x }));

        nextQuestion(0);
    }, [phrase, mode]);

    const nextQuestion = (nextPartIndex: number) => {

        const parts = partsRef.current;
        let nextPart = parts[nextPartIndex];
        while (nextPart
            && !normalizeAnswer(nextPart.text, mode)
            && nextPartIndex < parts.length
        ) {
            nextPartIndex++;
            nextPart = parts[nextPartIndex];
        }

        if (!nextPart) {
            onDone();
            return;
        }

        setPartIndex(nextPartIndex);

        const wrongOptions = getWrongOptions(nextPart.text, parts.map(x => x.text), mode);

        const options = shuffle([nextPart.text, ...wrongOptions.slice(0, 3)]);
        setOptions(options.map(x => ({
            isMarkedWrong: false,
            text: normalizeAnswer(x, mode),
        })));

        scrollToTarget();
    };

    const answer = (value: typeof options[number]) => {
        const parts = partsRef.current;
        const isNext = normalizeAnswer(parts[partIndex].text, mode).startsWith(normalizeAnswer(value.text, mode));

        if (!isNext) {
            value.isMarkedWrong = true;
            parts[partIndex].wasWrong = true;
            setOptions(s => s.map(x => ({ ...x })));
            return;
        }

        nextQuestion(partIndex + 1);
    };

    const parts = partsRef.current;
    const partsCompleted = parts.slice(0, partIndex);
    const isDone = partIndex >= parts.length;

    return (
        <>
            <div className=''>
                <div key={`text-${partIndex}`} className='mb-2 whitespace-pre-line'>
                    <span>{prephrase} </span>
                    {partsCompleted.map((x, i) => (
                        <Fragment key={i}>
                            <span
                                className={x.wasWrong ? `text-red-600` : ``}
                            >{x.text} </span>
                        </Fragment>
                    ))}
                    <span>{!isDone ? `___` : ``}</span>
                    <span className='inline-block relative'>
                        <span ref={targetRef} className='absolute top-[-2rem]' />
                    </span>
                </div>
                {!isDone && (
                    <div key={`options-${partIndex}`}>
                        <div className='flex flex-row flex-wrap justify-center items-center'>

                            {options.map((x, i) => (
                                <Fragment key={i}>
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
                {/* {isDone && (
                    <button
                        className={`m-1 p-1 min-w-[60px] min-h-[24px] bg-blue-400 active:bg-blue-600`}
                        onClick={() => onDone()}>Next</button>
                )} */}

                <div className='h-[50vh]' />
            </div>
        </>
    );
};
