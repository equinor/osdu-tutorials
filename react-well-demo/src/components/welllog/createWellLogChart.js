import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (
  wellLogRoot,
  readoutRoot,
  wellLogData,
  curveTypes
) => {
  wellLogRoot.width = 400;
  wellLogRoot.height = 800;

  const wellbore = (wellLogRoot.wellborePath = new WellborePath(0, [
    { md: 0, tvd: 0 },
    { md: 1500, tvd: 1500 },
    { md: 3000, tvd: 3000 },
    { md: 4500, tvd: 4500 },
  ]));

  let depthType = null;

  if (curveTypes.includes("DEPTH")) {
    depthType = "DEPTH";
    const index = curveTypes.indexOf("DEPTH");
    if (index > -1) {
      curveTypes.splice(index, 1);
    }
  } else if (curveTypes.includes("TDEP")) {
    depthType = "TDEP";
    const index = curveTypes.indexOf("TDEP");
    if (index > -1) {
      curveTypes.splice(index, 1);
    }
  } else if (curveTypes.length <= 1) {
    return null;
  } else {
    return null;
  }

  const config = {
    activeScale: 0,
    tracks: curveTypes.forEach((type, i) => {
      return [
        {
          id: i,
          kind: "graph",
          header: {
            label: `${type}`,
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
                opacity: 0.5,
                lineType: 0,
                name: `${type}`,
                color: "#0d47a1",
                unit: "",
                scale: {
                  kind: "linear",
                  domain: [
                    wellLogData[0][`${type}`],
                    wellLogData.slice(-1)[`${type}`],
                  ],
                },
                plotData: [
                  wellLogData.map((y) => y[`${depthType}`]),
                  wellLogData.map((x) => x[`${type}`]),
                ],
              },
            ],
          },
        },
      ];
    }),
    wellbore,
  };

  const renderReadout = (depth) =>
    Readout(readoutRoot, config, depth.md, {
      showHeaders: true,
      columns: 2,
    });
  renderReadout({ md: 1 });
  wellLogRoot.activeScale = config.activeScale;
  wellLogRoot.tracks = config.tracks;
  wellLogRoot.addEventListener("wellxWellLogRubberBand", (event) =>
    renderReadout(event.detail.depth)
  );
};
