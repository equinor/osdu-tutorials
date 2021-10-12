import "./styles.css";
import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Label
} from "recharts";

const data = [
    {
        "datetime": "2021-01",
        "max": 18,
        "Shell": 7,
        "Equinor": 7,
    },
    {
        "datetime": "2021-02",
        "max": 18,
        "Shell": 7,
        "Equinor": 9,
    },
    {
        "datetime": "2021-03",
        "max": 18,
        "Shell": 7,
        "Equinor": 4,
    },
    {
        "datetime": "2021-04",
        "max": 18,
        "Shell": 5,
        "Equinor": 10,
    },
    {
        "datetime": "2021-05",
        "max": 18,
        "Shell": 7,
        "Equinor": 2,
    },
    {
        "datetime": "2021-06",
        "max": 18,
        "Shell": 3,
        "Equinor": 7,
    },
];

export function BarChart() {
  return (
    <ComposedChart
      width={1000}
      height={500}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 100,
        bottom: 5
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="datetime" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="Shell" stackId="a" fill="#f5c82a" />
      <Bar dataKey="Equinor" stackId="a" fill="#DC143C"/>
      <Line type="linear" dataKey="max" stroke="#b0b0b0"/>
    </ComposedChart>
  );
}
