import { useEffect, useState } from 'preact/hooks';
import { LevelPartsViewer, TileGridViewer } from '@local/tiles-ui';
import { createRandomizer, Int32, ValueTypes } from '@local/core';
import { Tile, TileGrid, createTileGrid, extractLevelParts, levelPartsSource_castle, LevelPart, buildLevel } from '@local/tiles';


export function App() {

  const [levelParts, setLevelParts] = useState(undefined as undefined | ReturnType<typeof buildLevel>['levelParts']);
  const [level, setLevel] = useState(undefined as undefined | TileGrid);
  const [levelGen, setLevelGen] = useState(undefined as undefined | ReturnType<typeof buildLevel>['levelGen']);

  const load = () => {
    // const levelParts = extractLevelParts(levelPartsSource_castle);
    // setLevelParts(levelParts);

    const { level, levelGen, levelParts } = buildLevel(levelPartsSource_castle, ValueTypes.Vector2({ x: 10, y: 10 }), {
      randomizer: createRandomizer('42'),
    });
    setLevel(level);
    setLevelGen(levelGen);
    setLevelParts(levelParts);
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
            <TileGridViewer tileGrid={levelGen} CustomComponent={({ tile }) => (
              <div
                className='flex flex-row flex-wrap overflow-hidden w-32 h-32 text-white'
              >
                {tile.part && (
                  <TileGridViewer tileGrid={tile.part} />
                )}
                {!tile.part && (
                  <div>{tile.possiblePartIndexes.map(x => x).join(' ')}</div>
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
            <LevelPartsViewer levelParts={levelParts} />
          )}
          {/* <TileGridViewer tileGrid={createTileGrid({ x: 16 as Int32, y: 16 as Int32 })} /> */}
        </div>
      </div>
    </>
  )
}

