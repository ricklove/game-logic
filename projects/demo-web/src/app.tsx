import { useState } from 'preact/hooks';
import { TileGridViewer } from '@local/tiles-ui';
import { Int32 } from '@local/core';
import { Tile, TileGrid, createTileGrid } from '@local/tiles';


export function App() {
  return (
    <>
      <div className='flex flex-row bg-black p-8'>
        <div>
          <TileGridViewer tileGrid={createTileGrid({ x: 16 as Int32, y: 16 as Int32 })} />
        </div>
      </div>
    </>
  )
}

