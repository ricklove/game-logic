import { Fragment } from 'react';
import { MemoryProblemsPage } from '@local/bible-ui';
import { TilesPage } from '@local/tiles-ui';

export const App = () => {

  const pages = [`tiles`, `bible`, `home`] as const;
  const page: typeof pages[number] = window.location.href.includes(`/tiles`) ? `tiles`
    : window.location.href.includes(`/bible`) ? `bible`
      : `home`;


  return (
    <>
      {page === `tiles` && (
        <TilesPage />
      )}
      {page === `bible` && (
        <MemoryProblemsPage />
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
