import { Fragment } from 'react';
import { TilesPage } from '@local/tiles-ui';
import { WatchPage } from './pages/watch';

export const App = () => {

  const pages = [`tiles`, `watch`, `home`] as const;
  const page: typeof pages[number] = window.location.href.includes(`/tiles`) ? `tiles`
    : window.location.href.includes(`/watch`) ? `watch`
      : `home`;


  return (
    <>
      {page === `tiles` && (
        <TilesPage />
      )}
      {page === `watch` && (
        <WatchPage />
      )}
      {page === `home` && (
        <div className='flex flex-col p-2'>
          {pages.map(x => (
            <Fragment key={x}>
              <a href={`/${x}`}>{x}</a>
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
};
