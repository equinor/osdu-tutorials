import { Readout, WellborePath, WellxTypes } from "@equinor/wellx-wellog";

export function createWellLogChart(wellLogRoot, readoutRoot, wellLogData) {
  wellLogRoot.width = 400;
  wellLogRoot.height = 800;

  console.log(wellLogData);

  if (wellLogData !== undefined) {
    /*
        let grPlotData = [];
        for (let i=0; i<100; ++i) {
            grPlotData.push([wellLogData.data[tvdIdx]])
        }
        */

    const config = {
      activeScale: 0,
      tracks: [
        {
          id: 19,
          kind: "graph",
          header: {
            label: "Stability curves",
          },
          legend: {
            kind: "graph",
          },
          widthMultiplier: 2.5,
          plot: {
            kind: "graph",
            plots: [
              {
                kind: "line",
                lineType: 0,
                name: "GR",
                color: "#22aa99",
                unit: "",
                scale: {
                  kind: "linear",
                  domain: [0, 100],
                },
                plotData: wellLogData,
              },
            ],
          },
        },
      ],
      wellborePath: new WellborePath(0, [
        { md: 0, tvd: 0 },
        { md: 1500, tvd: 1500 },
        { md: 3000, tvd: 2500 },
        { md: 4500, tvd: 3200 },
      ]),
    };

    const renderReadout = (depth) =>
      Readout(readoutRoot, config, depth.md, {
        showHeaders: true,
        columns: 1,
      });
    renderReadout({ md: null });

    wellLogRoot.activeScale = config.activeScale;
    wellLogRoot.wellborePath = config.wellborePath;
    wellLogRoot.tracks = config.tracks;
    wellLogRoot.addEventListener("wellxWellLogRubberBand", (event) =>
      renderReadout(event.detail.depth)
    );
  }
}
