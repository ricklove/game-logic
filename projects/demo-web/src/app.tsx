import { useEffect, useRef, useState } from 'preact/hooks';
import { LevelPartReference, LevelPartsViewer, TileGridViewer } from '@local/tiles-ui';
import { createRandomizer, Int32, ValueTypes, delay } from '@local/core';
import { useAsyncWorker } from '@local/core-ui';
import { Tile, TileGrid, createTileGrid, extractLevelParts, levelPartsSource_castle, LevelPart, buildLevel_waveFunctionCollapse, BuildLevelResult, levelPartsSource_castleRooms, levelPartsSource_castleRoutes } from '@local/tiles';
import { JSX } from 'preact';


export function App() {

  const [results, setResults] = useState(undefined as undefined | BuildLevelResult);

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
    onResults: (value: BuildLevelResult) => void,
}) => {

  const [seed, setSeed] = useState('42');
  const [maxSteps, setMaxSteps] = useState(1000);
  const [levelSize, setLevelSize] = useState({ x: 40, y: 20 });
  const [partSize, setPartSize] = useState(3);
  const [overlap, setOverlap] = useState(2);

  const getSettings = () => {
    return ({
      seed,
      maxSteps,
      levelSize,
      partSize,
      overlap,
    });
  };
  const settingsRef = useRef(getSettings());
  settingsRef.current = getSettings();

  const { loading, error, doWork } = useAsyncWorker();

  const load = () => {
    doWork(async (stopIfObsolete) => {
    // const levelParts = extractLevelParts(levelPartsSource_castle);
    // setLevelParts(levelParts);

      const {
        seed,
        maxSteps,
        levelSize,
        partSize,
        overlap,
      } = settingsRef.current;

      const results = await buildLevel_waveFunctionCollapse(levelPartsSource_castleRoutes, ValueTypes.Vector2(levelSize), {
        randomizer: createRandomizer(seed),
        maxSteps,
        partSize: ValueTypes.Vector2({ x: partSize, y: partSize }),
        overlap,
        onProgress: (r) => {
          onResults(r);
        },
      });
      stopIfObsolete();
      onResults(results);
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      console.log('keydown', { key: e.key });
      if (e.key === 'd') {
        settingsRef.current.maxSteps++;
        setMaxSteps(settingsRef.current.maxSteps);
        load();
      }
      if (e.key === 'a') {
        settingsRef.current.maxSteps--;
        setMaxSteps(settingsRef.current.maxSteps);
        load();
      }
      if (e.key === 'r') {
        settingsRef.current.seed = `${Math.random()}`;
        setSeed(settingsRef.current.seed);
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
          Level Size:
        </div>
        <div className='p-2'>
          x:
        </div>
        <div className='p-2 text-black'>
          <input type='number' value={`${levelSize.x}`} min="10" max="1000" onChange={(e) => setLevelSize(s => ({ ...s, x: Number.parseInt(e.currentTarget.value) }))} />
        </div>
        <div className='p-2'>
          y:
        </div>
        <div className='p-2 text-black'>
          <input type='number' value={`${levelSize.y}`} min="10" max="1000" onChange={(e) => setLevelSize(s => ({ ...s, y: Number.parseInt(e.currentTarget.value) }))} />
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
    value: BuildLevelResult,
}) => {

  const {
    level,
    levelAsParts,
    levelGen,
    levelParts,
  } = value;

  return (
    <>
      <Expandable title='Level' expanded>
        <div className='flex flex-row bg-black p-8'>
          <div>
            {level && (
              <TileGridViewer tileGrid={level} />
            )}
          </div>
        </div>
      </Expandable>
      <Expandable title='Level as Parts'>
        <div className='flex flex-row bg-black p-8'>
          <div>
            {levelAsParts && (
              <TileGridViewer tileGrid={levelAsParts} />
            )}
          </div>
        </div>
      </Expandable>
      <Expandable title='Debug'>
        <>
          <div>
            Level Gen
          </div>
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
          <div>
            Level Parts
          </div>
          <div className='flex flex-row bg-black p-8'>
            <div>
              {levelParts && (
                <LevelPartsViewer levelParts={levelParts} allLevelParts={levelParts} />
              )}
              {/* <TileGridViewer tileGrid={createTileGrid({ x: 16 as Int32, y: 16 as Int32 })} /> */}
            </div>
          </div>
        </>
      </Expandable>
    </>
  );
};


const Expandable = ({
  title,
  expanded,
  children,
}: {
  title: string,
  expanded?: boolean,
  children: JSX.Element
}) => {
  const [expand, setExpand] = useState(expanded ?? false);

  return (
    <>
      <div onClick={() => setExpand(s => !s)}>{title}</div>
      {expand && (
        <>
          {children}
        </>
      )}
    </>
  );
};

