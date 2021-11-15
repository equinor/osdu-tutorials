import React from "react";

import { Readout } from '@equinor/wellx-wellog';

class WellXComponent extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        if (this.myRef != null) {
            console.log(this.myRef.current);
            const controller = new Controller({
                container: this.myRef.current,
                axisOptions: { unitOfMeasure: 'm', xLabel: 'x', yLabel: 'y' },
            });
            controller.adjustToSize(200, 400);
            controller.addLayer(new GridLayer('grid'));
        }
    }

    render() {
        return <div ref={this.myRef} />;
    }
}

export default WellXComponent;