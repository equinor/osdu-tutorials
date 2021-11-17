import React from "react";
import {Readout, WellborePath, WellxTypes} from '@equinor/wellx-wellog'
import "./welllog.css"

class Welllog extends React.Component {
    constructor(props) {
        super(props)
        this.wellLog = React.createRef()
        this.readout = React.createRef()
    }

    // HTML in render method
    render() {
        return (
            <div className="chart">
                <wellx-welllog ref={this.wellLog}></wellx-welllog>
                <div class="readout" ref={this.readout}></div>
            </div>
        )
    }

    componentDidMount() {
        const wellLog = this.wellLog.current
        const readoutElem = this.readout.current
        wellLog.width = 400;
        wellLog.height = 800;

        const config = {
            activeScale: 0,
            tracks: [
                {
                    id: 19,
                    kind: 'graph',
                    header: {
                        label: 'Stability curves',
                    },
                    legend: {
                        kind: 'graph',
                    },
                    widthMultiplier: 2.5,
                    plot: {
                        kind: 'graph',
                        plots: [
                            {
                                kind: 'line',
                                lineType: WellxTypes.LinePlotType['DashDot'],
                                name: 'Name 1',
                                color: '#DD2C00',
                                unit: '',
                                scale: {
                                    kind: 'linear',
                                    domain: [0, 2.2],
                                },
                                plotData: [
                                    [0, 2.2],
                                    [1500, 1.8],
                                    [4000, 0.5],
                                ],
                            },
                            {
                                kind: 'line',
                                lineType: 0,
                                name: 'Name 2',
                                color: '#22aa99',
                                unit: '',
                                scale: {
                                    kind: 'linear',
                                    domain: [0, 2.2],
                                },
                                plotData: [
                                    [0, 1.5],
                                    [500, 1.6],
                                    [2000, 1.8],
                                    [4500, 1.5],
                                ],
                            },
                        ],
                    },
                },
            ],
            wellborePath: new WellborePath(0, [
                {md: 0, tvd: 0},
                {md: 1500, tvd: 1500},
                {md: 3000, tvd: 2500},
                {md: 4500, tvd: 3200},
            ]),
        }

        const renderReadout = (depth) =>
            Readout(readoutElem, config, depth.md, {
                showHeaders: 1,
                columns: 1,
            })
        renderReadout({md: null})

        wellLog.activeScale = config.activeScale
        wellLog.wellborePath = config.wellborePath
        wellLog.tracks = config.tracks
        wellLog.addEventListener('wellxWellLogRubberBand', (event) =>
            renderReadout(event.detail.depth),
        )
    }
}

export default Welllog;