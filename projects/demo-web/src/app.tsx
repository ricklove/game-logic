import { useEffect, useState } from 'preact/hooks';
import { LevelPartsViewer, TileGridViewer } from '@local/tiles-ui';
import { createRandomizer, Int32, ValueTypes } from '@local/core';
import { Tile, TileGrid, createTileGrid, extractLevelParts, levelPartsSource_castle, LevelPart, buildLevel } from '@local/tiles';


export function App() {

  const [levelParts, setLevelParts] = useState(undefined as undefined | LevelPart[]);
  const [level, setLevel] = useState(undefined as undefined | TileGrid);
  const [levelGen, setLevelGen] = useState(undefined as undefined | ReturnType<typeof buildLevel>['levelGen']);

  const load = () => {
    const levelParts = extractLevelParts(levelPartsSource_castle);
    setLevelParts(levelParts);

    const { level, levelGen } = buildLevel(levelPartsSource_castle, ValueTypes.Vector2({ x: 10, y: 10 }), {
      randomizer: createRandomizer('42'),
    });
    setLevel(level);
    setLevelGen(levelGen);
  };

  return (
    <>
      <div>
        <button onClick={load}>
          Load
        </button>
      </div>
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
            <TileGridViewer tileGrid={levelGen} />
          )}
        </div>
      </div>
      Level Parts
      <div className='flex flex-row bg-black p-8'>
        <div>
          {levelParts && (
            <LevelPartsViewer levelParts={levelParts} />
          )}
          {/* <TileGridViewer tileGrid={createTileGrid({ x: 16 as Int32, y: 16 as Int32 })} /> */}
        </div>
      </div>
    </>
  )
}

