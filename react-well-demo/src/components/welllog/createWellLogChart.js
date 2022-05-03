import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (wellLogRoot, readoutRoot, wellLogData) => {
  wellLogRoot.width = 400;
  wellLogRoot.height = 800;

  if (wellLogData !== undefined) {
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
                plotData: [
                  [0, 15],
                  [10, 50],
                  [25, 100],
                ],
              },
              {
                kind: "line",
                lineType: 0,
                name: "DEPTH",
                color: "#CD5C5C",
                unit: "",
                scale: {
                  kind: "linear",
                  domain: [0, 100],
                },
                plotData: [
                  [0, 70],
                  [35, 150],
                  [60, 10],
                ],
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
    renderReadout({ md: 1 });

    wellLogRoot.activeScale = config.activeScale;
    wellLogRoot.wellborePath = config.wellborePath;
    wellLogRoot.tracks = config.tracks;
    wellLogRoot.addEventListener("wellxWellLogRubberBand", (event) =>
      renderReadout(event.detail.depth)
    );
  }
};
