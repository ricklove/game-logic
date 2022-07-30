import { useState } from 'preact/hooks';
import { TileGridViewer } from '@local/tiles-ui';

export function App() {
  return (
    <>
      <div className='flex flex-row bg-slate-100'>
        <div>Test 1</div>
        <div>Test 2</div>
        <div>Test 3</div>
        <div>Test 4</div>

        <div>
          <TileGridViewer/>
        </div>
      </div>
    </>
  )
}
