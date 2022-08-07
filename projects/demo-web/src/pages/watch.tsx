import { useEffect } from 'react';

export const WatchPage = () => {


    useEffect(() => {
        // <meta name="disable-adaptations" content="watch">
        const metaTag = document.createElement(`meta`);
        metaTag.setAttribute(`name`, `disable-adaptations`);
        metaTag.setAttribute(`content`, `watch`);
        document.head.appendChild(metaTag);
    }, []);

    return (
        <>
            <div className='bg-black text-white w-[100vw] h-[100vh]'>
                <div className=''>In the beginning</div>
                <div>
                    <div className='flex flex-row flex-wrap justify-center items-center'>
                        <button className='m-1 p-1 min-w-[4rem] bg-slate-400 active:bg-slate-600'>god</button>
                        <button className='m-1 p-1 min-w-[4rem] bg-slate-400 active:bg-slate-600'>the</button>
                        <button className='m-1 p-1 min-w-[4rem] bg-slate-400 active:bg-slate-600'>light</button>
                        <button className='m-1 p-1 min-w-[4rem] bg-slate-400 active:bg-slate-600'>first</button>
                    </div>
                </div>
            </div>
        </>
    );
};
