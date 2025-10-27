'use client'

import { Button, Card, CardHeader, Image, Input, Link, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react"
import { useState } from "react"

export default function PalleteComponent({isValid, palletes, excel, rows, orders, auth, createPallete, numberOfPallete, createExcel}: { isValid: any, palletes?: any, rows: any, orders: any, excel: any, auth: any, createPallete: any, numberOfPallete: any, createExcel: any}) {

    const [valueQR, setValueQR] = useState('')
    //const [tbPalletes, setTbPallettes] = useState([...palletes])

    /*const columns = [
        { uid: 'for', name: 'Для компании' },
        { uid: 'date', name: 'Дата отгрузки' },
        { uid: 'order', name: '№ заказа' },
        { uid: 'box', name: '№ коробки' },
        { uid: 'palletenumber', name: '№ паллето-места' },
    ]*/

    const [sheets, setSheets] = useState(['Паллеты фурнитура', 'Гола', 'Цоколь', 'Длинномер', 'Паллеты мойки/техника', 'Отдельно стоящие', 'Столешницы/панели', 'Кромка'] as any)

    const columns = [
        { uid: 'order', name: '№ заказа' },
        { uid: 'sheet-Паллеты фурнитура', name: 'Паллеты фурнитура' },
        { uid: 'sheet-Гола', name: 'Гола' },
        { uid: 'sheet-Цоколь', name: 'Цоколь' },
        { uid: 'sheet-Длинномер', name: 'Длинномер' },
        { uid: 'sheet-Паллеты мойки/техника', name: 'Паллеты мойки/техника' },
        { uid: 'sheet-Отдельно стоящие', name: 'Отдельно стоящие' },
        { uid: 'sheet-Столешницы/панели', name: 'Столешницы/панели' },
        { uid: 'sheet-Кромка', name: 'Кромка' },
        { uid: 'all', name: 'Общее' },
    ]

    const [selectRow, setSelectRow] = useState(-1)
    const [numberPallete, setNumberPallete] = useState(-1)
    const [statusPallete, setStatusPallete] = useState('')

    const [loadExcel, setLoadExcel] = useState({path: '', access: false})

    return (
        <div className="w-[100vw]  flex flex-col overflow-x-hidden p-8">
            {isValid ?
                <>
                    <div className="bg-[#207346] min-h-1/8 h-1/8 flex gap-4 pl-4 pt-4 justify-between">
                        <div className="h-full flex flex-col w-1/3">
                            <p className="input-label pb-4">Заказ для {excel.for} на {excel.date}</p>
                        </div>
                        {/*<Button
                            radius="none"
                            color="default"
                            variant="ghost"
                            className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/6 mx-8 mb-4"
                            style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                        >
                            <Link 
                                href={loadExcel.access ? loadExcel.path: '#'}
                                download={loadExcel.access}
                                className="w-1/2 mx-auto text-white"
                                onClick={async (e: any) => {
                                    if(!loadExcel.access) {
                                        let ordersExcel = [] as any
                                        for(let order of orders) {
                                            ordersExcel.push({
                                                '№ заказа': order._id,
                                                'Паллеты фурнитура': 'коробок - ' + rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Паллеты фурнитура'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                    return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Паллеты фурнитура'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                }).length,
                                                'Гола': 'мест - ' + rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Гола'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                    return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Гола'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                }).length,
                                                'Цоколь': 'мест - ' + rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Цоколь'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                    return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Цоколь'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                }).length,
                                                'Длинномер': 'мест - ' + rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Длинномер'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                    return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Длинномер'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                }).length,
                                                'Общее': 'мест - ' + rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад']}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                    return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад']}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                }).length
                                            })
                                        }

                                        const path = await createExcel(ordersExcel, `Заказ для ${excel.for} на ${excel.date}`)
                                        setLoadExcel({path, access: true})
                                    }
                                }}
                            >
                                <div className=" grid items-center gradien_ff9237 h-8 w-full rounded press_button_by_byfonicle">
                                    <p className={`text_main text-center mx-2 font_family_Montserrat text-[12px]`}>{loadExcel.access ? 'Скачать файл': 'Сформировать файл'}</p>
                                </div>
                            </Link>
                        </Button>*/}
                        {/*<Input 
                            type="Считыватель QR-кодов" 
                            label="Считыватель QR-кодов"
                            variant="underlined" 
                            value={valueQR}
                            classNames={{
                                base: 'bg-transparent w-1/2'
                            }}
                            onValueChange={async (e: any) => {
                                if(e == 'n' || e == 'т') {
                                    const newNumber = await numberOfPallete(excel._id)
                                    setNumberPallete(newNumber)
                                    setStatusPallete('n')
                                    setValueQR('')
                                } else
                                if(e == 'k' || e == 'л') {
                                    setStatusPallete('k')
                                    setValueQR('')
                                } else {
                                    setValueQR(e)
                                }

                                if(e.indexOf('%7D') != -1 && e.indexOf('%7D') == e.length - 3){
                                    if(statusPallete == 'k') {
                                        let qr = decodeURI(e).split('stringForQR=')[1] as any
                                        qr = JSON.parse(qr)

                                        const tbPallete = tbPalletes.find((tbp: any) => tbp.excelId == excel._id && tbp.order == qr.orderNum && tbp.box == qr.numBox)
                                        setNumberPallete(tbPallete ? tbPallete.numberPallete : -1)
                                    } else
                                    if(numberPallete != -1 && statusPallete == 'n') {
                                        let qr = decodeURI(e).split('stringForQR=')[1] as any
                                        qr = JSON.parse(qr)
                                        //console.log({qr: JSON.parse(qr)})

                                        const newPalletes = await createPallete({
                                            excelId: excel._id,
                                            for: excel.for,
                                            date: excel.date,
                                            order: qr.orderNum,
                                            box: qr.numBox,
                                            palletenumber: numberPallete,
                                            profile: auth.name
                                        })
                                        setTbPallettes([...newPalletes])
                                    }
                                    setValueQR('')
                                }
                            }}
                            onClick={(e: any) => {
                                setValueQR('')
                            }}  
                        />
                        <div className="flex flex-col">
                            <Card className="max-w-[400px] max-h-[65px] bg-transparent">
                                <CardHeader className="flex gap-3">
                                    <Image
                                        alt="nextui logo"
                                        height={40}
                                        radius="sm"
                                        src={auth.img}
                                        width={40}
                                    />
                                    <div className="flex flex-col">
                                        <p className="text-md text-white">{auth.name}</p>
                                        <p className="text-small text-default-500">{auth.job}</p>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>*/}
                    </div>
                    <div className="min-h-7/8 h-7/8 overflow-y-hidden">
                        <Table
                            isHeaderSticky
                            classNames={{
                                base: 'min-h-[99%] h-[99%] overflow-y-none rounded-none mb-4',
                                wrapper: 'bg-transparent shadow-none !p-0 !rounded-none',
                                thead: 'rounded-none [&>tr]:first:!rounded-none border-b-1 border-divider bg-transparent',
                                table: ' h-[99%] overflow-y-auto',
                                tr: `rounded-none  odd:bg-[#A6A6A6] even:bg-[#D9D9D9] hover:[#FFC000] `,
                                th: 'bg-transparent input-label bg-[#000000] first:!rounded-s-none last:rounded-e-none',
                                td: 'border-1 border-[#000000] text-center'
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
                                {
                                    orders.map((order: any, index: number) => {
                                        return (
                                            <TableRow key={`row-${index}`} className={`${selectRow == index ? '!bg-[#FFC000]' : ''}`} onClick={(e: any) => {setSelectRow(index)}}>
                                                <TableCell>
                                                    {order._id}
                                                </TableCell>
                                                <TableCell>
                                                    коробок - {rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Паллеты фурнитура'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                        return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Паллеты фурнитура'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                    }).length}
                                                </TableCell>
                                                <TableCell>
                                                    мест - {rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Гола'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                        return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Гола'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                    }).length}
                                                </TableCell>
                                                <TableCell>
                                                    мест - {rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Цоколь'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                        return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Цоколь'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                    }).length}
                                                </TableCell>
                                                <TableCell>
                                                    мест - {rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Длинномер'}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                        return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад'] == 'Длинномер'}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                    }).length}
                                                </TableCell>
                                                <TableCell>
                                                    мест - {rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад']}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                                        return rows.filter((row: any) => {return row.structure && row.structure['№ коробки'] && row.structure['Номер заказа'] == order._id && row.structure['Склад']}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                                    }).length}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </div>
                </>
                :
                <div className="bg-[#207346] min-h-3/6 h-3/6 flex gap-4 pl-4 pt-4">

                </div>
            }   
        </div>
    )
}


/*{tbPalletes.map((row: any, index: number) => {
                                    return (
                                        <TableRow key={`row-${index}`} className={`${selectRow == index ? '!bg-[#FFC000]' : ''}`} onClick={(e: any) => {setSelectRow(index)}}>
                                            {columns.map((col: any, jndex: number) => {
                                                return (
                                                    <TableCell>
                                                        {row[col.uid] ? row[col.uid] : ''}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}*/