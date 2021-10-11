import React from "react";
import {Column, DualAxes} from "@ant-design/charts";


export function BarChart() {
    var data = [
        {
            "datetime": "2021-01",
            "max": 18,
            "value": 7,
            "company": "Shell",
        },
        {
            "datetime": "2021-02",
            "max": 18,
            "value": 5,
            "company": "Shell",
        },
        {
            "datetime": "2021-03",
            "max": 18,
            "value": 5,
            "company": "Shell",
        },
        {
            "datetime": "2021-04",
            "max": 18,
            "value": 9,
            "company": "Shell",
        },
        {
            "datetime": "2021-01",
            "max": 18,
            "value": 5,
            "company": "Equinor",
        },
        {
            "datetime": "2021-02",
            "max": 18,
            "value": 9,
            "company": "Equinor",
        },
        {
            "datetime": "2021-03",
            "max": 18,
            "value": 3,
            "company": "Equinor",
        },
        {
            "datetime": "2021-04",
            "max": 18,
            "value": 7,
            "company": "Equinor",
        },
    ];

    var config = {
        data: [data, data],

        xField: "datetime",
        yField: ["value", "max"],
        yAxis: {
            max: {
                min: 0,
                max: 20,
                top: true,
                autoHide: true
            },
            num: {
                min: 0,
                max: 20,
                top: true,
                        }
        },
        geometryOptions: [
            { geometry: 'column',
            seriesField: "company",
            color: ['#f5c82a', '#DC143C'],
            isStack: true,
        },
            {
              geometry: 'line',
            },
          ],
        interactions: [
            {
              type: 'active-region',
              enable: false,
            },
          ]
            };
    return (
        <>
            < DualAxes{...config} width={1000} />
        </>
    );
}