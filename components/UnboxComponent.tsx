'use client'

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useState } from "react";

export default function UnboxComponent({ rows, order }: { rows: any, order: any }) {

    const columns = [
        { uid: 'Name', name: 'Наименование' },
        { uid: 'Count', name: 'Кол-во' }
    ]
    
    const [selectRow, setSelectRow] = useState(-1)

    return (
        <div className="w-[100vw] flex flex-col overflow-y-auto p-8">
            <div className="flex w-full flex-row-reverse pb-4">
                <div className="flex flex-col w-1/2 items-center">
                    <p className="border-1 font-bold w-full border-black text-center">Дата отгрузки:</p>
                    <p className="border-1 w-full border-black text-center">{order.date}</p>
                    <p className="border-1 font-bold w-full border-black text-center">Компания:</p>
                    <p className="border-1 w-full border-black text-center">{order.for}</p>
                    <p className="border-1 font-bold w-full border-black text-center">Заказ №:</p>
                    <p className="border-1 w-full border-black text-center">{order.orderNum}</p>
                    <p className="border-1 font-bold w-full border-black text-center">Коробка №:</p>
                    <p className="border-1 w-full border-black text-center">{order.numBox}</p>
                </div>
            </div>
            <Table
                isHeaderSticky
                classNames={{
                    base: 'min-h-[85%] h-[85%] overflow-y-none rounded-none mb-4',
                    wrapper: 'bg-transparent shadow-none !p-0 !rounded-none',
                    thead: 'rounded-none [&>tr]:first:!rounded-none border-b-1 border-divider bg-transparent',
                    table: ' h-full overflow-y-auto',
                    tr: `rounded-none  odd:bg-[#A6A6A6] even:bg-[#D9D9D9] hover:[#FFC000] `,
                    th: 'bg-transparent input-label bg-[#000000] first:!rounded-s-none last:rounded-e-none',
                    td: 'border-1 border-[#000000]'
                }}
                aria-label="Example table with custom cells">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} className="mx-auto text-center">
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody>
                    {rows.map((row: any, index: number) => {
                        return (
                            <TableRow key={`row-${index}`} className={`${selectRow == index ? '!bg-[#FFC000]' : ''}`} onClick={(e: any) => {setSelectRow(index)}}>
                                {columns.map((col: any, jndex: number) => {
                                    return (
                                        <TableCell>
                                            {col.name == 'Кол-во' ? 
                                                row && row[col.name] ? Math.ceil(row[col.name]) : '' :
                                                row[col.name] ? row[col.name] : ''}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}