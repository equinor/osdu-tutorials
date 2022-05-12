import { Readout, WellborePath } from "@equinor/wellx-wellog";

export const createWellLogChart = (wellLogRoot, readoutRoot, wellLogData) => {
  wellLogRoot.width = 400;
  wellLogRoot.height = 800;

  var curveTypes = new Set();
  var curveTypeArray = [
    "DEPTH",
    "TDEP",
    "TICKS_PRES",
    "TICK_ARC_GR",
    "TICK_ARC_RES",
    "DEPT",
    "LSPD",
    "CCL",
    "LTEN",
    "GR",
  ];

  const wellbore = (wellLogRoot.wellborePath = new WellborePath(0, [
    { md: 0, tvd: 0 },
    { md: 1500, tvd: 1500 },
    { md: 3000, tvd: 3000 },
    { md: 4500, tvd: 4500 },
  ]));

  curveTypeArray.forEach((t) => {
    if (wellLogData[5].hasOwnProperty(t)) {
      curveTypes.add(t);
    }
  });

  console.log(curveTypes, wellLogData);

  const config = {
    activeScale: 0,
    tracks: [
      curveTypes.has("TDEP") && {
        id: 1,
        kind: "graph",
        header: {
          label: "TDEP",
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
              name: "TDEP",
              color: "#0d47a1",
              unit: "",
              scale: {
                kind: "linear",
                domain: [0, 7000],
              },
              plotData: [wellLogData.map((d) => [d.TDEP, d.GR_ARC])],
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
