import {Controller, GridLayer, IntersectionReferenceSystem, WellborepathLayer} from "@equinor/esv-intersection";
import {WellboreTrajectoryPoint} from "../../api/wellbore_trajectory.api";

function createChartRootElement(): HTMLElement {
    const root = document.createElement('div');
    //root.classList.add('trajectory-chart__layout');

    return root;
}

export function createTrajectoryChart(
    container: HTMLElement,
    points: WellboreTrajectoryPoint[],
) {
    const root = createChartRootElement();
    container.innerHTML = '';
    container.appendChild(root);

    const wellboreId = "Wellborepath";

    if (points.length > 1) {

        const referenceSystem = new IntersectionReferenceSystem(points.map((p) => [p.azimuth, p.inclination, p.tvd]));

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


        const layers = [
            gridLayer,
            wellboreLayer,
        ];

        const xBounds: [number, number] = [0, 1000];
        const yBounds: [number, number] = [0, 1000];

        const controller = new Controller({
            container: container,
            layers: layers,
            axisOptions: {unitOfMeasure: 'm', xLabel: 'Displacement', yLabel: 'MD'},
            scaleOptions: {
                xBounds: xBounds,
                yBounds: yBounds
            },
        });

        controller.adjustToSize(700, 400);
        controller.setViewport(1000, 1500, 5000);
        controller.showLayer(wellboreId);
        controller.zoomPanHandler.zFactor = 1;
    }
}