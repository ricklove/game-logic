import { useEffect, useState } from 'preact/hooks';
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

  const [maxSteps, setMaxSteps] = useState(60);
  const { loading, error, doWork } = useAsyncWorker();

  const load = () => {
    doWork(async (stopIfObsolete) => {
    // const levelParts = extractLevelParts(levelPartsSource_castle);
    // setLevelParts(levelParts);

      await delay(0);
      const results = buildLevel(levelPartsSource_castle, ValueTypes.Vector2({ x: 10, y: 10 }), {
        randomizer: createRandomizer('42'),
        maxSteps,
      });
      stopIfObsolete();

      onResults(results);
    });
  };

  return (
    <div className='flex flex-col items-start p-4'>
      {loading && (
        <div className='animate-spin'>
          {`🧨`}
        </div>
      )}
      <div>
        <div className='flex flex-row'>
          <div className='p-2'>
            Max Steps:
          </div>
          <div className='p-2 text-black'>
            <input type='number' value={`${maxSteps}`} min="1" max="1000000" onChange={(e) => setMaxSteps(Number.parseInt(e.currentTarget.value))} />
          </div>
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