import { useState } from "react";

export const TileGridViewer = () => {

    const [test, setTest] = useState('TEST');

    return (
        <div>
            {test}
        </div>
    );
};