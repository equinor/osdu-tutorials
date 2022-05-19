import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (
  wellLogRoot,
  readoutRoot,
  wellLogData,
  curveTypes
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

  var depthType = "";

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
  } else if (curveTypes.includes("DEPT")) {
    depthType = "DEPT";
    const index = curveTypes.indexOf("DEPT");
    if (index > -1) {
      curveTypes.splice(index, 1);
    }
  } else if (curveTypes.length <= 1) {
    return null;
  }

  curveTypes.forEach((type, i) => {
    console.log([
      wellLogData.map((y) => +y[`${depthType}`]),
      wellLogData.map((x) => +x[`${type}`]),
    ]);
  });

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
              color: colorArray[Math.floor(Math.random() * colorArray.length)],
              unit: "",
              scale: {
                kind: "linear",
                domain: [
                  +wellLogData[0][`${type}`],
                  +wellLogData.slice(-1)[`${type}`],
                ],
              },
              plotData: [
                wellLogData.map((y) => +y[`${depthType}`]),
                wellLogData.map((x) => +x[`${type}`]),
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
