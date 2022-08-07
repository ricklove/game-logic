import { Fragment } from 'preact';
import { TilesPage } from './pages/tiles';
import { WatchPage } from './pages/watch';


export function App() {

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
}
