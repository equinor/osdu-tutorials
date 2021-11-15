import React from "react";

import {
    CalloutCanvasLayer,
    Controller,
    GridLayer,
    IntersectionReferenceSystem,
    WellborepathLayer
} from '@equinor/esv-intersection';
import {getPicks, getPositionLog, getStratColumns} from "./data";

import "./intersection.css";
import {getPicksData, transformFormationData} from "./utils";

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        if (this.myRef != null) {
            const wellboreId = "Wellborepath";
            const xBounds = [0, 1000];
            const yBounds = [0, 1000];

            Promise.all([getPositionLog(), getPicks(), getStratColumns()]).then((values) => {
                const [poslog, picks, stratcolumn] = values;

                const transformedData = transformFormationData(picks, stratcolumn);
                const referenceSystem = new IntersectionReferenceSystem(poslog.map((p) => [p.easting, p.northing, p.tvd]));
                const picksData = getPicksData(transformedData);

                const gridLayer = new GridLayer('grid', {
                    majorColor: 'black',
                    minorColor: 'gray',
                    majorWidth: 0.5,
                    minorWidth: 0.5,
                    order: 1,
                    referenceSystem,
                });

                const wellboreLayer = new WellborepathLayer(wellboreId, {
                    order: 2,
                    strokeWidth: '2px',
                    stroke: 'red',
                    referenceSystem: referenceSystem,
                });

                const calloutLayer = new CalloutCanvasLayer('callout', {
                    order: 3,
                    data: picksData,
                    referenceSystem: referenceSystem}
                );

                const layers = [
                    gridLayer,
                    wellboreLayer,
                    calloutLayer,
                ];

                const controller = new Controller({
                    container: this.myRef.current,
                    layers: layers,
                    axisOptions: {unitOfMeasure: 'm', xLabel: 'Displacement', yLabel: 'MD'},
                    scaleOptions: {xBounds, yBounds},
                });

                controller.adjustToSize(700, 400);
                controller.setViewport(1000, 1500, 5000);
                controller.showLayer(wellboreId);
                controller.zoomPanHandler.zFactor = 1;
            });
        }
    }

    render() {
        return (
            <div className="intersection-container">
                <div className="header">Intersection</div>
                <div className="intersection-root">
                    <div ref={this.myRef} className="intersection-layers"/>
                </div>
            </div>
        );
    }
}

export default MyComponent;