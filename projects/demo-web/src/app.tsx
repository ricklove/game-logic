import { useState } from 'preact/hooks';
import { TileGridViewer } from '@local/tiles-ui';
import { Int32 } from '@local/core';

export function App() {
  return (
    <>
      <div className='flex flex-row bg-slate-100'>
        <div>
          <TileGridViewer tileGrid={{
            tiles: [[{ position: { x: 0 as Int32, y: 0 as Int32 } }]],
            width: 1 as Int32,
            height: 1 as Int32,
          }}/>
        </div>
      </div>
    </>
  )
}
