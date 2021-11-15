import React from "react";

import {
    CompletionLayer,
    Controller,
    GridLayer,
    IntersectionReferenceSystem,
    WellborepathLayer
} from '@equinor/esv-intersection';
import {
    getCasings, getCement,
    getCompletion,
    getHolesize, getPicks,
    getSeismic,
    getStratColumns,
    getSurfaces,
    getWellborePath
} from "./data";

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();

        const promises = [
            getWellborePath(),
            getCompletion(),
            getSeismic(),
            getSurfaces(),
            getStratColumns(),
            getCasings(),
            getHolesize(),
            getCement(),
            getPicks(),
        ];

        Promise.all(promises).then((values) => {
            console.log("data", values)
            const [path, completion, seismic, surfaces, stratColumns, casings, holesizes, cement, picks] = values;
            const referenceSystem = new IntersectionReferenceSystem(path);
            referenceSystem.offset = path[0][2];

            const displacement = referenceSystem.displacement || 1;
            const extend = 1000 / displacement;
            const steps = surfaces[0]?.data?.values?.length || 1;
            const traj = referenceSystem.getTrajectory(steps, 0, 1 + extend);
            const trajectory = IntersectionReferenceSystem.toDisplacement(traj.points, traj.offset);

            this.completion = completion;

            this.referenceSystem = referenceSystem;
        });
    }

    componentDidMount() {
        if (this.myRef != null) {
            const xBounds = [0, 1000];
            const yBounds = [0, 1000];
            const referenceSystem = this.referenceSystem;
            const completion = this.completion;
            const gridLayer = new GridLayer('grid', {
                majorColor: 'black',
                minorColor: 'gray',
                majorWidth: 0.5,
                minorWidth: 0.5,
                order: 1,
                referenceSystem,
            });
            const wellboreLayer = new WellborepathLayer('wellborepath', {
                order: 3,
                strokeWidth: '2px',
                stroke: 'red',
                referenceSystem
            });

            const completionLayer = new CompletionLayer('completion', {
                order: 4,
                data: completion,
                referenceSystem
            });

            const layers = [
                gridLayer,
                wellboreLayer,
                completionLayer,
            ];

            console.log(completionLayer);

            const controller = new Controller({
                container: this.myRef.current,
                layers: layers,
                axisOptions: { unitOfMeasure: 'm', xLabel: 'Displacement', yLabel: 'MD' },
                scaleOptions: {xBounds, yBounds},
            });
            controller.adjustToSize(700, 400);
            controller.addLayer(gridLayer);
            controller.addLayer(wellboreLayer);
            controller.setViewport(1000, 1500, 5000);
            controller.zoomPanHandler.zFactor = 1;
        }
    }

    render() {
        return <div ref={this.myRef} />;
    }
}

export default MyComponent;