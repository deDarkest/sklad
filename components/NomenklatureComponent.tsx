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

import LineComponent from "./LineComponent";
import moment from "moment";
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TooltipChart,
    Title,
    Legend
  );

  export const options = {
    responsive: true,
    interaction: {
      mode: 'nearest' as const,
      intersect: true,
    },
    stacked: true,
    plugins: {
      title: {
        display: false,
        text: 'Chart.js Line Chart - Multi Axis',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      }
    },
  };

export default function NomenklatureComponent({ summarries }: { summarries: any }) {

    const columns = [
        { uid: '_id', name: 'Позиция' }
    ]

    function compare( a: any, b: any ) {
        if ( a.date < b.date ){
          return -1;
        }
        if ( a.date > b.date ){
          return 1;
        }
        return 0;
    }

    return (
        <div className="w-[100vw] flex flex-col overflow-y-auto p-8">
            {summarries.map((sum: any, index: number) => {
                return (
                        <>
                            <p>{sum._id}</p>
                            <div className='grid grid-cols-2 gap-16'>
                                <div className="w-full">
                                    <LineComponent options={options} data={{
                                        labels: sum.combinedCounts.map((scc: any, index: number) => { return {for: scc.for, date: moment(scc.date, 'DD.MM.YYYY').toDate().valueOf()}}).sort(compare).map((scc: any) => {return scc.for + ';' + moment(scc.date).format('DD.MM.YYYY')}),
                                        datasets: [
                                            {
                                                label: 'Количество в заказах',
                                                data: sum.combinedCounts.map((scc: any) => {return scc.count}),
                                                borderColor: 'rgb(255, 99, 132)',
                                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                            }
                                        ],
                                    }}/>
                                </div>
                                <div className="w-full">
                                    <LineComponent options={options} data={{
                                        labels: sum.combinedCounts.map((scc: any, index: number) => { return {for: scc.for, date: moment(scc.date, 'DD.MM.YYYY').toDate().valueOf()}}).sort(compare).map((scc: any) => {return scc.for + ';' + moment(scc.date).format('DD.MM.YYYY')}),
                                        datasets: [
                                            {
                                                label: 'Сумма закуп',
                                                data: sum.combinedCounts.map((scc: any, index: number) => { return {for: scc.for, date: moment(scc.date, 'DD.MM.YYYY').toDate().valueOf()}}).sort(compare).map((scc: any) => {return {for: scc.for, date: moment(scc.date).format('DD.MM.YYYY')}}).map((scc: any) => {return sum.combinedPP.find((scpp: any) => {return scpp.for == scc.for && scpp.date == scc.date}).price}),
                                                borderColor: 'rgb(255, 123, 0)',
                                                backgroundColor: 'rgba(255, 123, 0, 0.5)',
                                            },
                                            {
                                                label: 'Сумма продажи',
                                                data: sum.combinedCounts.map((scc: any, index: number) => { return {for: scc.for, date: moment(scc.date, 'DD.MM.YYYY').toDate().valueOf()}}).sort(compare).map((scc: any) => {return {for: scc.for, date: moment(scc.date).format('DD.MM.YYYY')}}).map((scc: any) => {return sum.combinedSP.find((scpp: any) => {return scpp.for == scc.for && scpp.date == scc.date}).price}),
                                                borderColor: 'rgb(129, 55, 147)',
                                                backgroundColor: 'rgba(129, 55, 147, 0.5)',
                                            }
                                        ],
                                    }}/>
                                </div>
                            </div>
                        </>
                )
            })}
        </div>
    )
}