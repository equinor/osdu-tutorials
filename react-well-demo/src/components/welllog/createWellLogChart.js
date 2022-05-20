import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (
  wellLogRoot,
  readoutRoot,
  wellLogData,
  curveTypes,
  depthType
) => {
  wellLogRoot.width = 1000;
  wellLogRoot.height = 1300;

  const wellbore = (wellLogRoot.wellborePath = new WellborePath(0, [
    { md: 0, tvd: 0 },
    { md: 1500, tvd: 1500 },
    { md: 3000, tvd: 3000 },
    { md: 4500, tvd: 4500 },
  ]));

  const colorArray = [
    "red",
    "blue",
    "green",
    "#967300",
    "rgb(0, 153, 255)",
    "orange",
    "purple",
    "gray",
    "black",
    "#ff46a2",
    "#8b58ff",
    "#75ff61",
  ];

  const config = {
    activeScale: 0,
    tracks: curveTypes.map((type, i) => {
      return {
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
              color: colorArray[i],
              unit: "",
              scale: {
                kind: "linear",
                domain: [
                  +wellLogData[0][`${type}`],
                  +wellLogData[wellLogData.length - 1][`${type}`],
                ],
              },
              plotData: [
                wellLogData.map((wellog) => [
                  +wellog[`${depthType}`],
                  +wellog[`${type}`],
                ]),
              ],
            },
          ],
        },
      };
    }),
    wellbore,
  };

  const renderReadout = (depth) =>
    Readout(readoutRoot, config, depth.md, {
      showHeaders: true,
      columns: 1,
    });
  renderReadout({ md: 1 });
  wellLogRoot.activeScale = config.activeScale;
  wellLogRoot.tracks = config.tracks;
  wellLogRoot.addEventListener("wellxWellLogRubberBand", (event) =>
    renderReadout(event.detail.depth)
  );
};
