'use client'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip as TooltipChart,
    Title,
    Legend,
  } from 'chart.js';

  import { Line } from 'react-chartjs-2';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TooltipChart,
    Title,
    Legend
  );

  export default function LineComponent({options, data}: any) {
    return (
      <Line className='' options={options} data={data} />
    )
  }