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
                    <div className='flex flex-col leading-8'>
                        <button>god</button>
                        <button>the</button>
                        <button>light</button>
                        <button>first</button>
                    </div>
                </div>
            </div>
        </>
    );
};
