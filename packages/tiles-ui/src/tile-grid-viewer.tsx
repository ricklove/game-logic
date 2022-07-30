import { TileGrid } from "@local/tiles";
import { useState } from "react";

export const TileGridViewer = ({
    tileGrid,
}: {
    tileGrid: TileGrid
}) => {

    const [test, setTest] = useState('TEST 2');

    return (
        <div>
            {test}
        </div>
    );
};