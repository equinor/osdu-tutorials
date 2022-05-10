import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (wellLogRoot, readoutRoot, wellLogData) => {
  var curveTypes = new Set();
  var curveTypeArray = [
    "DEPTH",
    "TDEP",
    "TICKS_PRES",
    "TICK_ARC_GR",
    "TICK_ARC_RES",
  ];

  const wellbore = (wellLogRoot.wellborePath = new WellborePath(0, [
    { md: 0, tvd: 0 },
    { md: 1500, tvd: 1500 },
    { md: 3000, tvd: 3000 },
    { md: 4500, tvd: 4500 },
  ]));

  curveTypeArray.forEach((t) => {
    if (wellLogData[0].hasOwnProperty(t)) {
      curveTypes.add(t.toString());
    }
  });

  // wellLogData.map((type) =>
  //   curveTypes.map((t) => {
  //     if (type.hasOwnProperty(t)) {
  //       typeArray.push(t.toString());
  //     }
  //   })
  // );

  console.log(curveTypes);

  // console.log([
  //   wellLogData.map((d, i) => {
  //     if (i === 0) {
  //       return [wellLogData[0].TDEP, d.TDEP];
  //     }
  //     return [wellLogData[i - 1].TDEP, d.TDEP];
  //   }),
  // ]);

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
            // {
            //   kind: "line",
            //   opacity: 0.5,
            //   lineType: 0,
            //   name: "GR",
            //   color: "#22aa99",
            //   unit: "",
            //   scale: {
            //     kind: "linear",
            //     domain: [0, 100],
            //   },
            //   plotData: [wellLogData.map((d) => d.GR)],
            // },
            {
              kind: "line",
              opacity: 0.5,
              lineType: 0,
              name: "DEPTH",
              color: "#CD5C5C",
              unit: "",
              scale: {
                kind: "linear",
                domain: [0, 5000],
              },
              plotData: [
                wellLogData.map((d, i) => {
                  if (i === 0) {
                    return [wellLogData[0].TDEP, d.TDEP];
                  }
                  return [wellLogData[i - 1].TDEP, d.TDEP];
                }),
              ],
            },
          ],
        },
      },
    ],
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
