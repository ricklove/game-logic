import { useEffect, useRef, useState } from 'preact/hooks';
import { LevelPartReference, LevelPartsViewer, TileGridViewer } from '@local/tiles-ui';
import { createRandomizer, Int32, ValueTypes, delay } from '@local/core';
import { useAsyncWorker } from '@local/core-ui';
import { Tile, TileGrid, createTileGrid, extractLevelParts, levelPartsSource_castle, LevelPart, buildLevel } from '@local/tiles';


export function App() {

  const [results, setResults] = useState(undefined as undefined | ReturnType<typeof buildLevel>);

  return (
    <>
      <div className='bg-slate-800 text-white'>
        <Controls onResults={setResults} />
        {results && (<LevelInfo value={results} />)}
      </div>
    </>
  )
}

const Controls = ({
  onResults,
}: {
  onResults: (value: ReturnType<typeof buildLevel>) => void,
}) => {

  const [seed, setSeed] = useState('42');
  const [maxSteps, setMaxSteps] = useState(1000);
  const [partSize, setPartSize] = useState(3);
  const [overlap, setOverlap] = useState(2);
  const maxStepsRef = useRef(maxSteps);
  maxStepsRef.current = maxSteps;

  const { loading, error, doWork } = useAsyncWorker();

  const load = () => {
    doWork(async (stopIfObsolete) => {
    // const levelParts = extractLevelParts(levelPartsSource_castle);
    // setLevelParts(levelParts);

      await delay(0);
      const results = buildLevel(levelPartsSource_castle, ValueTypes.Vector2({ x: 64, y: 32 }), {
        randomizer: createRandomizer(seed),
        maxSteps: maxStepsRef.current,
        partSize: ValueTypes.Vector2({ x: partSize, y: partSize }),
        overlap,
      });
      stopIfObsolete();

      onResults(results);
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      console.log('keydown', { key: e.key });
      if (e.key === 'd') {
        setMaxSteps(s => maxStepsRef.current = s + 1);
        load();
      }
      if (e.key === 'a') {
        setMaxSteps(s => maxStepsRef.current = s - 1);
        load();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    }
  }, []);

  return (
    <div className='flex flex-col items-start p-4'>
      {loading && (
        <div className='animate-spin'>
          {`🧨`}
        </div>
      )}
      <div className='flex flex-row'>
        <div className='p-2'>
          Seed:
        </div>
        <div className='p-2 text-black'>
          <input type='text' value={`${seed}`} onChange={(e) => setSeed(e.currentTarget.value)} />
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='p-2'>
          Max Steps:
        </div>
        <div className='p-2 text-black'>
          <input type='number' value={`${maxSteps}`} min="1" max="1000000" onChange={(e) => setMaxSteps(Number.parseInt(e.currentTarget.value))} />
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='p-2'>
          Part Size:
        </div>
        <div className='p-2 text-black'>
          <input type='number' value={`${partSize}`} min="2" max="10" onChange={(e) => setPartSize(Number.parseInt(e.currentTarget.value))} />
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='p-2'>
          Overlap:
        </div>
        <div className='p-2 text-black'>
          <input type='number' value={`${overlap}`} min="1" max={partSize - 1} onChange={(e) => setOverlap(Number.parseInt(e.currentTarget.value))} />
        </div>
      </div>
      <div className='p-2 bg-slate-900'>
        <button onClick={load}>
          Load
        </button>
      </div>
    </div>
  );
}

const LevelInfo = ({
  value,
}: {
  value: ReturnType<typeof buildLevel>,
}) => {

  const {
    level,
    levelGen,
    levelParts,
  } = value;

  return (
    <>
      Level
      <div className='flex flex-row bg-black p-8'>
        <div>
          {level && (
            <TileGridViewer tileGrid={level} />
          )}
        </div>
      </div>
      Level Gen
      <div className='flex flex-row bg-black p-8'>
        <div>
          {levelGen && (
            <TileGridViewer tileGrid={levelGen} CustomComponent={({ tile }) => (
              <div
                className='flex flex-row flex-wrap w-[300px] h-[300px] justify-start items-start text-white'
              >
                {tile.part && (
                  <div className=''>
                    <LevelPartsViewer levelParts={[tile.part]} allLevelParts={levelParts} />
                    {/* <TileGridViewer tileGrid={tile.part} /> */}
                  </div>
                )}
                {!tile.part && (
                  <div className='flex flex-row flex-wrap text-sm'>{tile.possiblePartIndexes.map(x => <LevelPartReference index={x} allLevelParts={levelParts} />)}</div>
                )}
              </div>
            )} />
          )}
        </div>
      </div>
      Level Parts
      <div className='flex flex-row bg-black p-8'>
        <div>
          {levelParts && (
            <LevelPartsViewer levelParts={levelParts} allLevelParts={levelParts} />
          )}
          {/* <TileGridViewer tileGrid={createTileGrid({ x: 16 as Int32, y: 16 as Int32 })} /> */}
        </div>
      </div>
    </>
  );
};