import React from "react";
import {Column, DualAxes} from "@ant-design/charts";


export function BarChart() {
    var data = [
        {
            "datetime": "2021-01",
            "max": 18,
            "num": 16,
        },
        {
            "datetime": "2021-02",
            "max": 18,
            "num": 17,
        },
        {
            "datetime": "2021-03",
            "max": 18,
            "num": 15,
        },
        {
            "datetime": "2021-04",
            "max": 18,
            "num": 20,
        },
    ];

    var config = {
        data: [data, data],
        xField: "datetime",
        yField: ["max", "num"],
        xAxis: {
            label: {
                autoHide: false,
            }
        },
        yAxis: {
            max: {
                min: 0,
                max: 20,
                autoHide: true
            },
            num: {
                min: 0,
                max: 20,
            }
        },
        geometryOptions: [
            {
                geometry: 'line',
                color: 'red',
                columnWidthRatio: 0.4,
            },
            {
                geometry: 'column',
                smooth: true,
                color: '#5AD8A6',
            },
        ],
        interactions: [{ type: 'element-highlight' }, { type: 'active-region' }],
    };
    return (
        <>
            <DualAxes {...config} width={1000} />
        </>
    );
}