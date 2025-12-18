'use client'

import { Button, Card, CardHeader, Input, Select, SelectItem, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Image, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Link, User, CardBody, CardFooter, Tooltip, Badge, CheckboxGroup, Checkbox, Divider, Switch, DatePicker } from "@nextui-org/react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import {parseAbsoluteToLocal} from "@internationalized/date";

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
  
export default function MainPageComponent({ 
    basicUrl, 
    auths, 
    profile, 
    isValids, 
    excels, 
    getexels, 
    uploadExcelFile, 
    getRowsExcel, 
    loadOrdersOfBase, 
    loadRowsOfBase, 
    signinHandler, 
    updateExcelRow, 
    updateRowsOfBase, 
    getNumberOfBox, 
    splittingThePosition,
    loadPositions,
    getOrdersByName,
    transferOrders,
    getExcelByName
}: { 
    basicUrl: any, 
    auths: any, 
    profile: any, 
    isValids: any, 
    excels: any, 
    getexels: any, 
    uploadExcelFile: any, 
    getRowsExcel: any, 
    loadOrdersOfBase: any, 
    loadRowsOfBase: any, 
    signinHandler: any, 
    updateExcelRow: any, 
    updateRowsOfBase: any, 
    getNumberOfBox: any, 
    splittingThePosition: any,
    loadPositions: any,
    getOrdersByName: any,
    transferOrders: any,
    getExcelByName: any
}) {

    function compare( a: any, b: any ) {
        if ( a < b ){
          return -1;
        }
        if ( a > b ){
          return 1;
        }
        return 0;
    }

    function comparePositionsInOrder( a: any, b: any ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
    }

    function compareExcelsDate( a: any, b: any ) {
        if ( moment(a.date, 'DD.MM.YYYY').toDate().valueOf() <= moment(b.date, 'DD.MM.YYYY').toDate().valueOf() ){
          return -1;
        }
        if ( moment(a.date, 'DD.MM.YYYY').toDate().valueOf() > moment(b.date, 'DD.MM.YYYY').toDate().valueOf() ){
          return 1;
        }
        return 0;
    }

    /*const columns = [
        {uid: 'Organization', name: 'Организация'},
        { uid: 'Number', name: 'Номер заказа' },
        { uid: 'Name', name: 'Наименование В Центре' },
        {uid: 'Vid', name: 'Вид'},
        { uid: 'Count', name: 'Кол-во' },
        { uid: 'Sborka', name: 'Сборка' },
        { uid: 'Status', name: 'Статус' },
        { uid: 'Box', name: '№ коробки' },
        { uid: 'Pallete', name: '№ паллета' },
        { uid: 'Date', name: 'Время сборки' },
    ]*/

    const columns = [
        { uid: 'Name', name: 'Наименование В Центре' },
        {uid: 'Vid', name: 'Вид'},
        { uid: 'Count', name: 'Кол-во' },
        { uid: 'Sborka', name: 'Сборка' },
        { uid: 'Status', name: 'Статус' },
        { uid: 'Box', name: '№ коробки' },
        { uid: 'Date', name: 'Время сборки' },
        { uid: 'Cell', name: 'Ячейка хранения' },
        { uid: 'Kompl', name: 'Комплектация' },
    ]

    const columnsPosition = [
        { uid: 'name', name: 'Наименование В Центре' },
        {uid: 'vid', name: 'Вид'},
        { uid: 'countOrders', name: 'Кол-во кухонь' },
        { uid: 'countAll', name: 'Кол-во общее' },
        { uid: 'countY', name: 'Кол-во собрано' },
        { uid: 'countN', name: 'Кол-во не собрано' },
        { uid: 'countNot', name: 'Кол-во без сборки' }
    ]

    const statusesValues = [
        {key: "all", label: "Все"},
        {key: "no", label: "Неопределено"},
        {key: "y", label: "Собрал"},
        {key: "n", label: "Не собрал"},
        {key: "p", label: "Не доложил"},
        {key: "d", label: "Доложил"},
        {key: "pallete", label: "На паллете"}
    ];

   // console.log({excels})
    
    const [datas, setDatas] = useState([] as any)
    const [settingGraphs, setSettingGraph] = useState(true)
    
    /*useEffect(() => {
        const fetchGet = () => {
            try {
                if(excels) {
                    let newDatas = [] as any

                    const bgcolor = [
                        {borderColor: 'rgb(0, 121, 182)',
                            backgroundColor: 'rgba(0, 121, 182, 0.5)'},
            
                        {borderColor: 'rgb(255, 123, 0)',
                            backgroundColor: 'rgba(255, 123, 0, 0.5)'},
            
                        {borderColor: 'rgb(129, 55, 147)',
                            backgroundColor: 'rgba(129, 55, 147, 0.5)'},
            
                        {borderColor: 'rgb(255, 223, 0)',
                            backgroundColor: 'rgba(255, 223, 0, 0.5)'},
            
                        {borderColor: 'rgb(0, 148, 82)',
                            backgroundColor: 'rgba(0, 148, 82, 0.5)'},
            
                        {borderColor: 'rgb(255, 0, 0)',
                            backgroundColor: 'rgba(255, 0, 0, 0.5)'}
                    ] 
            
                    const graphics = excels.map((excel: any, index: number) => { return excel.for}).filter(function(item: any, pos: any) {
                        return excels.map((excel: any, index: number) => { return excel.for}).indexOf(item) == pos;
                    })
            
                    //console.log({graphics})
            
                    let labels = [] as any
                    for(let g of graphics) {
                        labels.push({
                            for: g,
                            labels: settingGraphs ? excels.filter((excel: any) => {return excel.for == g}).map((excel: any, index: number) => { return moment('01.' + excel.date.slice(3), 'DD.MM.YYYY').toDate().valueOf()}).filter(function(item: any, pos: any) {
                                return excels.filter((excel: any) => {return excel.for == g}).map((excel: any, index: number) => { return moment('01.' + excel.date.slice(3), 'DD.MM.YYYY').toDate().valueOf()}).indexOf(item) == pos;
                            }).sort(compare).map((label: any) => {return moment(label).format('DD.MM.YYYY')}) : excels.filter((excel: any) => {return excel.for == g}).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).filter(function(item: any, pos: any) {
                                return excels.filter((excel: any) => {return excel.for == g}).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).indexOf(item) == pos;
                            }).sort(compare).map((label: any) => {return moment(label).format('DD.MM.YYYY')})
                        })
                    }
            
                    labels.push({
                        for: 'АВРОРА ОБЩЕЕ',
                        labels: settingGraphs ? excels.filter((excel: any) => {return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel.for)}).map((excel: any, index: number) => { return moment('01.' + excel.date.slice(3), 'DD.MM.YYYY').toDate().valueOf()}).filter(function(item: any, pos: any) {
                            return excels.filter((excel: any) => {return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel.for)}).map((excel: any, index: number) => { return moment('01.' + excel.date.slice(3), 'DD.MM.YYYY').toDate().valueOf()}).indexOf(item) == pos;
                        }).sort(compare).map((label: any) => {return moment(label).format('DD.MM.YYYY')}) : 
                        excels.filter((excel: any) => {return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel.for)}).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).filter(function(item: any, pos: any) {
                            return excels.filter((excel: any) => {return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel.for)}).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).indexOf(item) == pos;
                        }).sort(compare).map((label: any) => {return moment(label).format('DD.MM.YYYY')})
                    })
                
                    //console.log(labels)
            
                    let index = 0
                    for(let label of labels) {
                        newDatas.push({
                            labels: settingGraphs ? label.labels.map((ll: any) => {return ll.slice(3)}) : label.labels, 
                            datasets: [{
                                label: label.for,
                                data: label.labels.map((label1: any) => { 
                                    return label.for != 'АВРОРА ОБЩЕЕ' ? 
                                        settingGraphs ? excels.filter((excel1: any) => { return excel1.for == label.for && '01.' + excel1.date.slice(3) == label1 }).length > 0 ? excels.filter((excel1: any) => { return excel1.for == label.for && '01.' + excel1.date.slice(3) == label1 }).reduce(function (currentSum: any, currentNumber: any) {
                                                return currentSum + currentNumber.orders.length
                                            }, 0) : '' : excels.filter((excel1: any) => { return excel1.for == label.for && excel1.date }).length > 0 ? excels.filter((excel1: any) => { return excel1.for == label.for && excel1.date == label1 }).reduce(function (currentSum: any, currentNumber: any) {
                                                return currentSum + currentNumber.orders.length
                                            }, 0) : ''
                                    :
                                        settingGraphs ? excels.filter((excel1: any) => { return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel1.for) && '01.' + excel1.date.slice(3) == label1 }).reduce(function (currentSum: any, currentNumber: any) {
                                            return currentSum + currentNumber.orders.length
                                        }, 0) : excels.filter((excel1: any) => { return ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'АВРОРА 25-26'].includes(excel1.for) && excel1.date == label1 }).reduce(function (currentSum: any, currentNumber: any) {
                                            return currentSum + currentNumber.orders.length
                                        }, 0)
                                    }),
                                borderColor: bgcolor[index].borderColor,
                                backgroundColor: bgcolor[index].backgroundColor,
                                yAxisID: 'y',
                            }]
                        })
                        index++
                    }

                    setDatas([...newDatas])
                }
            
               // console.log({newDatas})
            } catch (error) {
                console.log(error)
            }
        }
        fetchGet()
    }, [settingGraphs])*/

    
    const [selectStatusValue, setSelectStatusValue] = useState("all")
    const [filterStatusOrder, setFilterStatusOrder] = useState('')
    const [filterOrderMy, setFilterOrderMy] = useState(false)
    
    const [isValid, setIsValid] = useState(isValids)
    const [submitting, setSubmitting] = useState(false)
    const [excelss, setExcelss] = useState(excels ? [...excels] : [] as any)
    const [selectExcel, setSelectExcel] = useState({for: '', date: '', name: ''} as any)
    const [newExcel, setNewExcel] = useState({orders: [], new: false, for: '', date: '', name: ''} as any)

    const isInvalidNewExcel = useMemo(() => {
        if (newExcel.orders.length == 0 || !newExcel.for || !newExcel.date || !newExcel.name) return true

        return false
    }, [newExcel])

    const [loadExcel, setLoadExcel] = useState({filename: '', for: '', date: ''} as any)
    const companies = ['АВРОРА', 'АВРОРА МЗ', 'АМЗ', 'Сердце Дома', 'КЗ', 'ДОМА ХОРОШО', 'АВРОРА 25-26', 'КЗ 25-26', 'Импульс Мебель']
    const isInvalidLoadExcel = useMemo(() => {
        if (!loadExcel.for || !loadExcel.date) return true

        return false
    }, [loadExcel])

    const [modalType, setModalType] = useState('')

    const [positionInOrder, setPositionInOrder] = useState(false)
    const [loadPositionsInOrder, setloadPositionsInOrder] = useState([] as any)
    const [excelsLoadPositions, setExcelsLoadPositions] = useState([] as any)

    const [ordersByName, setOrdersByName] = useState([] as any)

    const [sheets, setSheets] = useState(['Паллеты фурнитура', 'Гола', 'Цоколь', 'Длинномер', 'Паллеты мойки/техника', 'Отдельно стоящие', 'Столешницы/панели', 'Кромка'] as any)
    const [orders, setOrders] = useState([] as any)
    const [rows, setRows] = useState([] as any)
    const [selectRow, setSelectRow] = useState(-1)
    const [selectOrder, setSelectOrder] = useState('')
    const [numberOfBox, setNumberOfBox] = useState(0) as any

    const [name, setName] = useState("")
    const [password, setPassword] = useState("")

    const isInvalidName = useMemo(() => {
        if (name === "") return true

        return false
    }, [name])
    const isInvalidPassword = useMemo(() => {
        if (password === "") return true

        return false
    }, [password])

    const {isOpen, onOpen, onClose} = useDisclosure();

    useEffect(() => {
        const fetchGet = () => {
            try {
                if(selectExcel.name != '') {
                    setTimer()
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchGet()
    }, [selectExcel])

    function setTimer() {
    
        setTimeout(() => {
            updateRowsOfBase().then((data: any) => { 
                
                if (data.wsRead && data.wsRead.length > 0) {
                    setRows([...data.wsRead])
                    setOrders([...data.loadOrders])
                }
            })
            
            if(selectExcel.name != '')
                setTimer()
        }, 1000)
    }

    const [findExcel, setFindExcel] = useState({} as any)

    const [filterInLoadPositionTable, setFilterInLoadPositionTable] = useState({vid: null, name: null} as any)

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col overflow-y-hidden p-1">
            <form 
                action={uploadExcelFile}
                acceptCharset='utf-8'
            >
                <input id='uploadXlsFile' type="file" hidden name="file" value='' accept=".xls*" onChange={async (e: any) => {
                    if (e.target.files![0].name) {
                        let filename = e.target.files![0].name as any
                        (document.getElementById('uploadXlsName') as HTMLInputElement)!.value = filename as any
                        document.getElementById('uploadXlsSubmit')!.click();

                        const {excels} = await getexels()
                        setExcelss([...excels.reverse()])

                        await getRowsExcel(filename)

                        onClose()
                        alert('Файл загружен успешно! Выберите из его из списка, чтобы открыть.')
                        setSubmitting(false)
                        

                    } else setSubmitting(false)
                }} />
                <input id='uploadXlsSubmit' hidden type="submit" value="Upload" onChange={(e: any) => { }} />
                <input id='uploadXlsName' hidden type="text" name="fileName" defaultValue={''} />
                <input id='uploadXlsNameCompany' hidden type="text" name="nameCompany" defaultValue={''} />
                <input id='uploadXlsDate' hidden type="text" name="date" defaultValue={''} />
            </form>
            <Modal 
                size={"md"} 
                isOpen={isOpen} 
                onClose={onClose} 
            >
                <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 overflow-y-hidden">
                            {modalType == 'selectExcel' ? 
                                <div className="flex gap-3">
                                    {selectExcel.for && 
                                        <Image
                                            shadow="none"
                                            radius="none"
                                            width="20px"
                                            className="w-full object-cover cursor-pointer mt-1"
                                            title='назад'
                                            src={'/images/backblack.png'}
                                            onClick={() => {
                                                if(selectExcel.date)
                                                    setSelectExcel({...selectExcel, date: '', name: ''})
                                                else
                                                    setSelectExcel({for: '', date: '', name: ''})
                                            }}
                                        />
                                    }
                                    Выберите файл
                                </div>
                            : modalType == 'setOrders' ? 
                                <>Позиция в следующих заказах</>
                            : modalType == 'selectOrders' ?
                                <>Перенос заказов</>
                            : 
                                <></>
                            }
                            
                        </ModalHeader>
                        <ModalBody>
                            {modalType == 'setOrders' ? 
                                <div className="w-full flex-col max-h-[50vh] overflow-y-auto">
                                    {ordersByName.map((order: any) => {
                                        return (
                                            <div>
                                                <p>Файл: {order.excelName}</p>
                                                <p>Кол-во: {order.count}</p>
                                                <p>Номер заказа: {order.orderNum}</p>
                                                <p>Сборка: {order.sborka}</p>
                                                <Divider></Divider>
                                            </div>
                                        )
                                    })}
                                </div>
                            : modalType == 'selectExcel' ? 
                                <div className="w-full grid grid-cols-3">
                                    {
                                        selectExcel.for == '' ?
                                            excelss.map((excel: any, index: number) => { return excel.for}).filter(function(item: any, pos: any) {
                                                return excelss.map((excel: any, index: number) => { return excel.for}).indexOf(item) == pos;
                                            }).map((excel: any, index: number) => { 
                                                return (
                                                    <Card shadow="none" key={index} isPressable onPress={() => setSelectExcel({...selectExcel, for: excel})}>
                                                        <CardBody className="overflow-visible p-0 items-center">
                                                            <Image
                                                                shadow="none"
                                                                radius="none"
                                                                width="100%"
                                                                className="w-full object-cover mx-auto"
                                                                src={'/images/folder.png'}
                                                            />
                                                        </CardBody>
                                                        <CardFooter className="text-small justify-between">
                                                            <b className=" text-center w-full">{excel}</b>
                                                        </CardFooter>
                                                    </Card>
                                                )
                                            })
                                        : selectExcel.date == '' ?
                                            excelss.filter((excel: any) => excel.for == selectExcel.for).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).filter(function(item: any, pos: any) {
                                                return excelss.filter((excel: any) => excel.for == selectExcel.for).map((excel: any, index: number) => { return moment(excel.date, 'DD.MM.YYYY').toDate().valueOf()}).indexOf(item) == pos;
                                            }).sort(compare).reverse().map((excel: any, index: number) => { 
                                                return (
                                                    <Card shadow="none" key={index} isPressable onPress={() => setSelectExcel({...selectExcel, date: moment(excel).format('DD.MM.YYYY')})}>
                                                        <CardBody className="overflow-visible p-0 items-center">
                                                            <Image
                                                                shadow="none"
                                                                radius="none"
                                                                width="50%"
                                                                className="w-full object-cover"
                                                                src={'/images/folder.png'}
                                                            />
                                                        </CardBody>
                                                        <CardFooter className="text-small justify-between">
                                                            <b className=" text-center w-full">{moment(excel).format('DD.MM.YYYY')}</b>
                                                        </CardFooter>
                                                    </Card>
                                                )
                                            })
                                        :
                                            excelss.filter((excel: any) => excel.for == selectExcel.for && excel.date == selectExcel.date).map((excel: any, index: number) => { return excel.name}).filter(function(item: any, pos: any) {
                                                return excelss.filter((excel: any) => excel.for == selectExcel.for && excel.date == selectExcel.date).map((excel: any, index: number) => { return excel.name}).indexOf(item) == pos;
                                            }).map((excel: any, index: number) => { 
                                                return (
                                                    <Card shadow="none" key={index} isPressable onPress={async () => {
                                                        setSelectExcel({...selectExcel, name: excel}); 
                                                        onClose();
                                                        let { loadOrders } = await loadOrdersOfBase(excelss.find((excel1: any) => excel1.name == excel)._id)
                                                        //console.log([...loadOrders])
                                                        setOrders([...loadOrders])
                                                    }}>
                                                        <CardBody className="overflow-visible p-0 items-center">
                                                            <Image
                                                                shadow="none"
                                                                radius="none"
                                                                width="50%"
                                                                className="w-full object-cover"
                                                                src={'/images/excel.webp'}
                                                            />
                                                        </CardBody>
                                                        <CardFooter className="text-small justify-between">
                                                            <b className=" text-center w-full">{excel}</b>
                                                        </CardFooter>
                                                    </Card>
                                                )
                                            })
                                    }
                                </div>
                            : modalType == 'selectOrders' ? 
                                <div className="flex flex-col gap-3">
                                    <Select
                                        className="max-w-xs"
                                        isInvalid={isInvalidNewExcel && newExcel.orders.length == 0}
                                        errorMessage={isInvalidNewExcel && newExcel.orders.length == 0 && "Выберите заказы"}
                                        label="Выберите заказы"
                                        variant="underlined"
                                        placeholder="Выберите заказы"
                                        selectedKeys={newExcel.orders}
                                        selectionMode="multiple"
                                        onSelectionChange={(keys: any) => {
                                            setNewExcel({...newExcel, orders: Array.from(keys)})
                                        }}
                                        classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                    >
                                        {orders.map((order: any) => {
                                            return <SelectItem key={order.number}>{order.number}</SelectItem>
                                        })}
                                    </Select>
                                    <div className="flex gap-1">
                                        Файл: Создать новый
                                        <Switch 
                                            isSelected={newExcel.new}
                                            size="sm"
                                            color="success"
                                            onValueChange={(e: boolean) => {
                                                setNewExcel({...newExcel, new: e, name: e == true ? '' : `Новый-${selectExcel.name}`})
                                            }}
                                        >
                                        </Switch>
                                        Выбрать из списка
                                    </div>
                                    <Divider></Divider>
                                    {newExcel.new ? 
                                        <div className="flex flex-col">
                                            <Select
                                                className="max-w-xs"
                                                isInvalid={isInvalidNewExcel && !newExcel.for}
                                                errorMessage={isInvalidNewExcel && !newExcel.for && "Выберите имя компании"}
                                                label="Компания"
                                                variant="underlined"
                                                placeholder="Выберите компанию"
                                                selectedKeys={[newExcel.for]}
                                                onSelectionChange={(keys: any) => {
                                                    setNewExcel({...newExcel, for: Object(keys.valueOf())['anchorKey']})
                                                }}
                                                classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                            >
                                                {companies.map((company: any) => {
                                                    return <SelectItem key={company}>{company}</SelectItem>
                                                })}
                                            </Select>
                                            <DatePicker 
                                                className="w-full bg-transparent" 
                                                variant="underlined" 
                                                granularity="day"
                                                label="Дата отгрузки"
                                                isInvalid={isInvalidNewExcel && !newExcel.date}
                                                errorMessage={isInvalidNewExcel && !newExcel.date && "Выберите дату отгрузки"}
                                                value={newExcel.date ? parseAbsoluteToLocal(newExcel.date) : parseAbsoluteToLocal(new Date().toISOString())}
                                                onChange={(e: any) => {
                                                    setNewExcel({...newExcel, date: e.toDate().toISOString()})
                                                }}
                                            />
                                            <Select
                                                className="max-w-xs"
                                                isInvalid={isInvalidNewExcel && !newExcel.name}
                                                errorMessage={isInvalidNewExcel && !newExcel.name && "Выберите имя файла"}
                                                label="Файл"
                                                variant="underlined"
                                                placeholder="Выберите имя файла"
                                                selectedKeys={[newExcel.name]}
                                                onSelectionChange={(keys: any) => {
                                                    setNewExcel({...newExcel, name: Object(keys.valueOf())['anchorKey']})
                                                }}
                                                classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                            >
                                                {excelss.filter((excel: any) => excel.for == newExcel.for && excel.date == moment(newExcel.date).format('DD.MM.YYYY')).map((excel: any, index: number) => { return excel.name}).filter(function(item: any, pos: any) {
                                                    return excelss.filter((excel: any) => excel.for == newExcel.for && excel.date == moment(newExcel.date).format('DD.MM.YYYY')).map((excel: any, index: number) => { return excel.name}).indexOf(item) == pos;
                                                }).map((excel: any, index: number) => { 
                                                    return <SelectItem key={excel}>{excel}</SelectItem>
                                                })}
                                            </Select>
                                        </div>
                                        :
                                        <div className="flex flex-col">
                                            <Input 
                                                isInvalid={isInvalidNewExcel && !newExcel.name}
                                                errorMessage={isInvalidNewExcel && !newExcel.name && "Введите имя файла"}
                                                variant="underlined" 
                                                label="Имя файла(придумай)"
                                                value={newExcel.name}
                                                onChange={async (e: any) => {
                                                    setNewExcel({...newExcel, name: e.target.value})
                                                }}
                                                classNames={{
                                                    base: `w-full bg-transparent`
                                                }}
                                            />
                                            <Select
                                                className="max-w-xs"
                                                isInvalid={isInvalidNewExcel && !newExcel.for}
                                                errorMessage={isInvalidNewExcel && !newExcel.for && "Выберите имя компании"}
                                                label="Компания"
                                                variant="underlined"
                                                placeholder="Выберите компанию"
                                                selectedKeys={[newExcel.for]}
                                                onSelectionChange={(keys: any) => {
                                                    setNewExcel({...newExcel, for: Object(keys.valueOf())['anchorKey']})
                                                }}
                                                classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                            >
                                                {companies.map((company: any) => {
                                                    return <SelectItem key={company}>{company}</SelectItem>
                                                })}
                                            </Select>
                                            <DatePicker 
                                                className="w-full bg-transparent" 
                                                variant="underlined" 
                                                granularity="day"
                                                label="Дата отгрузки"
                                                isInvalid={isInvalidNewExcel && !newExcel.date}
                                                errorMessage={isInvalidNewExcel && !newExcel.date && "Выберите дату отгрузки"}
                                                value={newExcel.date ? parseAbsoluteToLocal(newExcel.date) : parseAbsoluteToLocal(new Date().toISOString())}
                                                onChange={(e: any) => {
                                                    setNewExcel({...newExcel, date: e.toDate().toISOString()})
                                                }}
                                            />
                                        </div>
                                    }
                                    <div className="w-full flex flex-row-reverse">
                                        <Image
                                            shadow="none"
                                            radius="none"
                                            width="20px"
                                            className="w-full object-cover cursor-pointer mt-1"
                                            title='готово'
                                            src={'/images/success.png'}
                                            onClick={async () => {
                                                if(!isInvalidNewExcel) {
                                                    const result = await transferOrders({selectExcel, newExcel: {...newExcel, date: moment(newExcel.date).format('DD.MM.YYYY')}})
                                                    if(result.success) {
                                                        onClose() 

                                                        const {excels} = await getexels()
                                                        setExcelss([...excels.reverse()])

                                                        let { loadOrders } = await loadOrdersOfBase(excelss.find((excel1: any) => excel1.name == selectExcel.name)._id)
                                                        //console.log([...loadOrders])
                                                        setOrders([...loadOrders])
                                                    } 
                                                    alert(result.success ? 'Заказы успешно перенесены' : 'Морис, я не можу создать такой файл!')
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            : modalType == 'loadExcel' ?
                                <div className="flex flex-col gap-3">
                                    <Select
                                        className="max-w-xs"
                                        isInvalid={isInvalidLoadExcel && !loadExcel.for}
                                        errorMessage={isInvalidLoadExcel && !loadExcel.for && "Выберите компанию"}
                                        label="Компания"
                                        variant="underlined"
                                        placeholder="Выберите компанию"
                                        selectedKeys={[loadExcel.for]}
                                        onSelectionChange={(keys: any) => {
                                            setLoadExcel({...loadExcel, for: Object(keys.valueOf())['anchorKey']})
                                        }}
                                        classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                    >
                                        {companies.map((company: any) => {
                                            return <SelectItem key={company}>{company}</SelectItem>
                                        })}
                                    </Select>
                                    <DatePicker 
                                        className="w-full bg-transparent" 
                                        variant="underlined" 
                                        granularity="day"
                                        label="Дата отгрузки"
                                        isInvalid={isInvalidLoadExcel && !loadExcel.date}
                                        errorMessage={isInvalidLoadExcel && !loadExcel.date && "Выберите дату"}
                                        value={loadExcel.date ? parseAbsoluteToLocal(loadExcel.date) : parseAbsoluteToLocal(new Date().toISOString())}
                                        onChange={(e: any) => {
                                            setLoadExcel({...loadExcel, date: e.toDate().toISOString()})
                                        }}
                                    />
                                    <div className="w-full flex flex-row-reverse">
                                        <Image
                                            shadow="none"
                                            radius="none"
                                            width="20px"
                                            className="w-full object-cover cursor-pointer mt-1"
                                            title='готово'
                                            src={'/images/success.png'}
                                            onClick={async () => {
                                                if(!isInvalidLoadExcel) {
                                                    (document.getElementById('uploadXlsNameCompany') as HTMLInputElement)!.value = loadExcel.for as any
                                                    (document.getElementById('uploadXlsDate') as HTMLInputElement)!.value = moment(loadExcel.date).format('DD.MM.YYYY')
                                                    document.getElementById('uploadXlsFile')!.click();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            :
                                <></>
                            }
                        </ModalBody>
                        <ModalFooter className="py-4 px-6 flex-initial text-large font-semibold flex flex-col gap-1 overflow-y-hidden">
                            {
                                modalType == 'selectExcel' ?
                                    <div>
                                        Поиск по № заказа
                                        <Input
                                            placeholder='Введите № заказа'
                                            label="№ заказа"
                                            variant="underlined" 
                                            classNames={{
                                                base: 'bg-transparent'
                                            }}
                                            onChange={async (e: any) => { 
                                                const excelFindFunc = await getExcelByName(e.target.value)
                                                setFindExcel({...excelFindFunc})
                                            }}
                                        />
                                            {findExcel.name ?
                                                <div className="w-full grid grid-cols-3 mt-2">
                                                    <Card shadow="none" isPressable onPress={async () => {
                                                        setSelectExcel({...findExcel}); 
                                                        onClose();
                                                        let { loadOrders } = await loadOrdersOfBase(findExcel._id)
                                                        //console.log([...loadOrders])
                                                        setOrders([...loadOrders])
                                                    }}>
                                                        <CardBody className="overflow-visible p-0 items-center">
                                                            <Image
                                                                shadow="none"
                                                                radius="none"
                                                                width="50%"
                                                                className="w-full object-cover"
                                                                src={'/images/excel.webp'}
                                                            />
                                                        </CardBody>
                                                        <CardFooter className="text-small justify-between">
                                                            <b className=" text-center w-full">{findExcel.name}</b>
                                                        </CardFooter>
                                                    </Card>
                                                </div>
                                                :
                                                <>  
                                                    Ничего не найдено...
                                                </>
                                            }
                                    </div>
                                :
                                    <>
                                    </> 
                            }
                        </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
            {isValid ?
                <>
                    <div className="bg-[#207346] min-h-1/6 h-1/6 flex gap-4 pl-4 pt-4 justify-between">
                        <div className="h-full flex flex-col w-1/2">
                            {selectExcel.name == '' ? 
                                <>
                                    <Button
                                        radius="none"
                                        color="default"
                                        variant="ghost"
                                        className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/2 mb-2"
                                        style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                        onClick={async (e) => {
                                            setSelectExcel({for: '', date: '', name: ''})
                                            setModalType('selectExcel')
                                            onOpen()
                                        }}
                                    >
                                        Выберите файл excel из списка
                                    </Button>
                                    <Button
                                        radius="none"
                                        color="default"
                                        variant="ghost"
                                        className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/2"
                                        style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                        onClick={async (e) => {
                                            setSubmitting(true)
                                            setLoadExcel({for: '', date: ''})

                                            setModalType('loadExcel')
                                            onOpen()
                                        }}
                                    >
                                        {submitting ? '...' : ''}Загрузить новый файл Excel
                                    </Button>
                                </> :
                                <>
                                    <Card className="max-h-[65px] bg-transparent rounded-l-none ml-[-16px]">
                                        <CardHeader className="flex gap-3">
                                            <Image
                                                shadow="none"
                                                radius="none"
                                                width="30px"
                                                className="w-full object-cover cursor-pointer"
                                                title='к выбору файла'
                                                src={'/images/back.png'}
                                                onClick={() => {
                                                    setSelectExcel({...selectExcel, name: ''}); 
                                                    setModalType('selectExcel')
                                                    setRows([])
                                                    onOpen()
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-md text-white">{selectExcel.name}</p>
                                                <p className="text-small text-default-500">Собрано: {orders.filter((order: any) => {return order.yCount == order.allCount}).length} из {orders.length}</p>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                    <div className="flex gap-2">
                                        <Button
                                            radius="none"
                                            color="default"
                                            variant="ghost"
                                            className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/3 mt-2"
                                            style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                            onClick={async (e: any) => {
                                                setPositionInOrder(!positionInOrder)
                                                if(positionInOrder == false) {
                                                    setExcelsLoadPositions([excelss.find((excel1: any) => excel1.name == selectExcel.name)._id])
                                                    const {loadRows} = await loadPositions([excelss.find((excel1: any) => excel1.name == selectExcel.name)._id])
                                                    setloadPositionsInOrder([...loadRows])
                                                }
                                            }}
                                        >
                                            {positionInOrder == false ? 'Несобранные позиции' : 'Сборка'}
                                        </Button>
                                        {positionInOrder == true ? 
                                            <>
                                                <Select
                                                    className="max-w-xs"
                                                    label="Выберите файлы"
                                                    variant="underlined"
                                                    placeholder="Выберите заказы"
                                                    selectedKeys={excelsLoadPositions}
                                                    selectionMode="multiple"
                                                    onSelectionChange={setExcelsLoadPositions}
                                                    classNames={{base: 'bg-transparent w-full !max-w-full'}}
                                                >
                                                    {excelss.sort(compareExcelsDate).reverse().map((excel: any) => (
                                                        <SelectItem key={excel._id}>{excel.name}</SelectItem>
                                                    ))}
                                                </Select>
                                                <Button
                                                    radius="none"
                                                    color="default"
                                                    variant="ghost"
                                                    className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/6 mt-2"
                                                    style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                                    onClick={async (e:any) => {
                                                        setloadPositionsInOrder([])
                                                        const {loadRows} = await loadPositions(excelsLoadPositions)
                                                        setloadPositionsInOrder([...loadRows])
                                                    }}
                                                >
                                                    ✔️
                                                </Button>
                                            </>
                                        :
                                            <Button
                                                radius="none"
                                                color="default"
                                                variant="ghost"
                                                className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/3 mt-2"
                                                style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                            >
                                                <Link href={`/pallete?excelId=${excelss.find((excel1: any) => excel1.name == selectExcel.name)._id}`} target='_blank' className="text-white">Сборка паллетов</Link> 
                                            </Button>
                                        }
                                        {['Nel','A','V','T'].includes(profile.name) && positionInOrder == false && 
                                            <Button
                                                radius="none"
                                                color="default"
                                                variant="ghost"
                                                className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/3 mt-2"
                                                style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                                                onClick={() => {
                                                    setModalType('selectOrders')
                                                    setNewExcel({orders: [], new: false, ...selectExcel, date: moment(selectExcel.date, 'DD.MM.YYYY').toDate().toISOString(), name: `Новый-${selectExcel.name}`})
                                                    setRows([])
                                                    onOpen()
                                                }}
                                            >
                                                Перенести заказы
                                            </Button>
                                        }
                                    </div>
                                </>
                            }
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row-reverse">
                                <Card className="max-w-[100px] max-h-[65px] bg-transparent rounded-r-none">
                                    <CardHeader className="flex gap-3">
                                        <Image
                                            alt="nextui logo"
                                            height={40}
                                            radius="sm"
                                            src={profile?.img || ''}
                                            width={40}
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-md text-white">{profile.name}</p>
                                            <p className="text-small text-default-500">{profile.job}</p>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </div>
                            <div className="flex">
                                {selectExcel.name != '' && selectOrder && <Input 
                                    label="№ коробки" 
                                    variant="underlined" 
                                    value={numberOfBox}
                                    onChange={async (e: any) => {
                                        //console.log({e: e.target.value})
                                        setNumberOfBox(e.target.value)
                                    }}
                                    classNames={{
                                        base: `w-[100px] mb-2 bg-transparent`
                                    }}
                                />}
                                {selectExcel.name != '' && rows.filter((row: any) => {return row.structure && row.structure['№ коробки']}).map((row: any, index: number) => { return row.structure['№ коробки']}) &&
                                    rows.filter((row: any) => {return row.structure && row.structure['№ коробки']}).map((row: any, index: number) => { return row.structure['№ коробки']}).length > 0 &&
                                    <Select
                                        variant={"underlined"}
                                        label="Печать этикетки"
                                        placeholder="Выберите № этикетки"
                                        className="w-[250px] mb-2"
                                        onSelectionChange={async (keys) => {
                                            /*let { wsRead } = await loadRowsOfBase(Object(keys.valueOf())['anchorKey']) 
                                            setSelectExcel(Object(keys.valueOf())['anchorKey'])
                                            setRows([...wsRead])*/
                                        }}
                                        selectedKeys={[]}
                                    >
                                        {rows.filter((row: any) => {return row.structure && row.structure['№ коробки']}).map((row: any, index: number) => { return row.structure['№ коробки']}).filter(function(item: any, pos: any) {
                                            return rows.filter((row: any) => {return row.structure && row.structure['№ коробки']}).map((row: any, index: number) => { return row.structure['№ коробки']}).indexOf(item) == pos;
                                        }).map((numBox: any) => (
                                            <SelectItem key={`eticket-${numBox}`} textValue={`Печать этикетки № ${numBox}`}>
                                                <Link 
                                                    href= {`${basicUrl}/api/getpdf?box=${JSON.stringify({excelId: excelss.find((excel1: any) => excel1.name == selectExcel.name)._id, selectOrder, numBox})}`} target="_blank"
                                                >Печать этикетки № {numBox}</Link>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                }
                            </div>
                        </div>
                    </div>
                    <div className={`min-h-5/6 h-5/6 overflow-y-hidden`}>
                        {orders.length > 0 ?
                            positionInOrder == true ?
                                <Tabs aria-label="Options" classNames={{base: 'bg-[#207346] w-full overflow-y-hidden', tabList:'mx-auto bg-[#207346]', panel: 'h-[99%] overflow-y-none'}}>
                                    {sheets.map((sh: any, index: number) => {
                                        return (
                                            <>
                                                <Tab key={`sh-${index}`} title={sh}>
                                                    <Table
                                                        isHeaderSticky
                                                        classNames={{
                                                            base: 'min-h-[85%] h-[85%] overflow-y-none rounded-none mb-4',
                                                            wrapper: 'bg-transparent shadow-none !p-0 !rounded-none',
                                                            thead: 'rounded-none [&>tr]:first:!rounded-none border-b-1 border-divider bg-transparent',
                                                            table: ' h-[99%] overflow-y-auto',
                                                            tr: `rounded-none  odd:bg-[#A6A6A6] even:bg-[#D9D9D9] hover:[#FFC000] `,
                                                            th: 'bg-transparent input-label bg-[#000000] first:!rounded-s-none last:rounded-e-none text-center',
                                                            td: 'border-1 border-[#000000] !p-1'
                                                        }}
                                                        aria-label="Example table with custom cells">
                                                        <TableHeader columns={columnsPosition}>
                                                            {(column) => (
                                                                <TableColumn key={column.uid}>
                                                                    {column.uid == 'vid' ? 
                                                                        <Select 
                                                                            variant="underlined"
                                                                            label={column.name}
                                                                            classNames={{base: "max-w-xs", innerWrapper: "w-[120px]", value: "input-label" }}
                                                                            onSelectionChange={async (keys) => {
                                                                               setFilterInLoadPositionTable({...filterInLoadPositionTable, vid: Object(keys.valueOf())['anchorKey']})
                                                                            }}
                                                                            selectedKeys={[filterInLoadPositionTable.vid]}
                                                                        >
                                                                            {loadPositionsInOrder.filter((p: any) => {return p.type == sh}).map((p: any, index: number) => { return p['vid']}).filter(function(item: any, pos: any) {
                                                                                return loadPositionsInOrder.filter((p: any) => {return p.type == sh}).map((p: any, index: number) => { return p['vid']}).indexOf(item) == pos;
                                                                            }).map((p: any, index: number) => { 
                                                                                return (
                                                                                    <SelectItem key={p}>
                                                                                        {p}
                                                                                    </SelectItem>
                                                                                )
                                                                            })}
                                                                        </Select> :
                                                                    column.uid == 'name' ?
                                                                        <Input
                                                                            placeholder='Наименование В Центре'
                                                                            label="Наименование В Центре"
                                                                            variant="underlined" 
                                                                            classNames={{
                                                                                base: 'bg-transparent', input: "input-label"
                                                                            }}
                                                                            value={filterInLoadPositionTable.name}
                                                                            onChange={(e: any) => { 
                                                                                setFilterInLoadPositionTable({...filterInLoadPositionTable, name: e.target.value})
                                                                            }}
                                                                        />
                                                                    :
                                                                        column.name
                                                                    }
                                                                    
                                                                </TableColumn>
                                                            )}
                                                        </TableHeader>
                                                        <TableBody>
                                                            {loadPositionsInOrder.filter((p: any) => {return (filterInLoadPositionTable.name ? p.name.indexOf(filterInLoadPositionTable.name) != -1 : p.name != undefined) && (filterInLoadPositionTable.vid?.length > 0 ? filterInLoadPositionTable.vid.includes(p.vid) : p.vid != undefined) && p.type == sh && (p.countN > 0 || p.countNot > 0)}).sort(comparePositionsInOrder).map((position: any, index: number) => {
                                                                return (
                                                                    <TableRow key={`row-${index}`} className={`${selectRow == index ? '!bg-[#FFC000]' : ''}`}  onClick={(e: any) => {setSelectRow(index)}}>
                                                                        {columnsPosition.map((col: any, jndex: number) => {
                                                                            return (
                                                                                <TableCell 
                                                                                    key={`col-${index}-${jndex}`} 
                                                                                    className={!['Наименование В Центре', 'Вид'].includes(col.name) ? "mx-auto text-center" : "cursor-pointer"}
                                                                                    onClick={async (e: any) => {
                                                                                        if(col.name == 'Наименование В Центре') {
                                                                                            const newOrdersByName = await getOrdersByName(position[col.uid])
                                                                                            setOrdersByName([...newOrdersByName])
                                                                                            setModalType('setOrders')
                                                                                            onOpen()
                                                                                        }
                                                                                        
                                                                                    }}
                                                                                >    
                                                                                    {
                                                                                        !['Наименование В Центре', 'Вид'].includes(col.name) ?  Math.ceil(position[col.uid]) : position[col.uid]
                                                                                    }
                                                                                    {
                                                                                        col.name != 'Наименование В Центре' ? `${['крепёжка угол', 'крепёжка шкант', 'крепёжка евро', 'крепёжка 30', 'крепёжка 16', 'крепёжка полк', 'крепёжка гв'].includes(position.type) ? ' гр.' : ''}` : ''
                                                                                    }
                                                                                </TableCell>
                                                                            )
                                                                        })}
                                                                    </TableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </Tab>
                                            </>
                                        )
                                    })}
                                </Tabs>
                            :
                                <Tabs aria-label="Options" classNames={{base: 'bg-[#207346] w-full overflow-y-hidden', tabList:'mx-auto bg-[#207346]', panel: 'h-[99%] overflow-y-none'}}>
                                    {sheets.map((sh: any, index: number) => {
                                        return (
                                            <>
                                                    <Tab key={`sh-${index}`} title={sh}>
                                                        {selectOrder && 
                                                            <Table
                                                                isHeaderSticky
                                                                classNames={{
                                                                    base: 'min-h-[85%] h-[85%] overflow-y-none rounded-none mb-4',
                                                                    wrapper: 'bg-transparent shadow-none !p-0 !rounded-none',
                                                                    thead: 'rounded-none [&>tr]:first:!rounded-none border-b-1 border-divider bg-transparent',
                                                                    table: ' h-[99%] overflow-y-auto',
                                                                    tr: `rounded-none  odd:bg-[#A6A6A6] even:bg-[#D9D9D9] hover:[#FFC000] `,
                                                                    th: 'bg-transparent input-label bg-[#000000] first:!rounded-s-none last:rounded-e-none',
                                                                    td: 'border-1 border-[#000000] !p-1'
                                                                }}
                                                                aria-label="Example table with custom cells">
                                                                <TableHeader columns={columns}>
                                                                    {(column) => (
                                                                        <TableColumn key={column.uid} className={column.uid === "Sborka" ? "mx-auto text-center" : ""}>
                                                                            {column.uid == 'Status' ? 
                                                                                <Select 
                                                                                    variant="underlined"
                                                                                    label={column.name}
                                                                                    classNames={{base: "max-w-xs", innerWrapper: "w-[120px]", value: "input-label" }}
                                                                                    onSelectionChange={async (keys) => {
                                                                                        setSelectStatusValue(Object(keys.valueOf())['anchorKey'])
                                                                                    }}
                                                                                    selectedKeys={[selectStatusValue]}
                                                                                >
                                                                                    {statusesValues.map((stv) => (
                                                                                        <SelectItem key={stv.key}>
                                                                                            {stv.label}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </Select> :
                                                                                column.name
                                                                            }
                                                                            
                                                                        </TableColumn>
                                                                    )}
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {rows.filter((row: any) => {
                                                                        return selectStatusValue == 'all' ? row.sheetName == sh :
                                                                            selectStatusValue == 'no' ? row.sheetName == sh && !row.structure['Сборка'] :
                                                                            row.sheetName == sh && row.structure['Сборка'] == selectStatusValue
                                                                    }).map((row: any, index: number) => {
                                                                        return (
                                                                            <TableRow key={`row-${index}`} className={`${selectRow == index ? '!bg-[#FFC000]' : ''}`}>
                                                                                {columns.map((col: any, jndex: number) => {
                                                                                    return (
                                                                                        <TableCell key={`col-${index}-${jndex}`} className={col.name == '№ коробки' || col.name == '№ паллета' ? "mx-auto text-center" : ""}>
                                                                                            {col.name == 'Сборка' ? 
                                                                                                    <Input 
                                                                                                        id={`input-${index}`}
                                                                                                        variant="underlined" 
                                                                                                        onFocus={() => {setSelectRow(index)}}
                                                                                                        value={row.structure[col.name] ? row.structure[col.name] : ''}
                                                                                                        onChange={async (e: any) => {
                                                                                                            if(e == '') return
                                                                                                            //console.log({e: e.target.value})
                                                                                                            let value = e.target.value[e.target.value.length - 1]
                                                                                                            value = ['л','Л','K'].includes(value) ? 'k' : ['н','Н','Y'].includes(value) ? 'y' : ['т','Т','N'].includes(value) ? 'n' : ['з','З','P'].includes(value) ? 'p' : ['в','В','D'].includes(value) ? 'd' : value
                                                                                                            let updateRows = [] as any
        
                                                                                                            if(value == 'k') {
                                                                                                                let newNumberOfBox = await getNumberOfBox(row.structure['Номер заказа'])
                                                                                                                setNumberOfBox(newNumberOfBox)
        
                                                                                                                for(let r of rows) {
                                                                                                                    updateRows.push(r._id == row._id ? {
                                                                                                                        ...r, 
                                                                                                                        structure: {...r.structure, '№ коробки': Number(newNumberOfBox)},
                                                                                                                        history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] 
                                                                                                                    }: r)
                                                                                                                
                                                                                                                    if(r._id == row._id) {
                                                                                                                        updateExcelRow({row: {
                                                                                                                            ...r, 
                                                                                                                            structure: {...r.structure, '№ коробки': Number(newNumberOfBox)},
                                                                                                                            history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] }})
                                                                                                                    }
                                                                                                                }
        
                                                                                                                e.target.value = ''
                                                                                                            }
                                                                                                            if(value == 'y' || value == 'p' || value == 'd') {
                                                                                                                if(!numberOfBox || numberOfBox == 0) {
                                                                                                                    return 
                                                                                                                }
        
                                                                                                                for(let r of rows) {
                                                                                                                    updateRows.push(r._id == row._id ? {
                                                                                                                        ...r, 
                                                                                                                        structure: {...r.structure, 'Сборка': row.structure['Сборка'] == 'p' ? 'd' : value, 'Время сборки':  new Date(), '№ коробки': Number(numberOfBox)},
                                                                                                                        history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] 
                                                                                                                    }: r)
                                                                                                                
                                                                                                                    if(r._id == row._id) {
                                                                                                                        updateExcelRow({row: {
                                                                                                                            ...r, 
                                                                                                                            structure: {...r.structure, 'Сборка': row.structure['Сборка'] == 'p' ? 'd' : value, 'Время сборки':  new Date(), '№ коробки': Number(numberOfBox)},
                                                                                                                            history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] }})
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                            if(value == 'n') {
                                                                                                                for(let r of rows) {
                                                                                                                    updateRows.push(r._id == row._id && r.structure['Сборка'] != 'pallete' ? {
                                                                                                                        ...r, 
                                                                                                                        structure: {...r.structure, 'Сборка': value, 'Время сборки':  new Date()},
                                                                                                                        history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] 
                                                                                                                    }: r)
                                                                                                                
                                                                                                                    if(r._id == row._id && r.structure['Сборка'] != 'pallete') {
                                                                                                                        updateExcelRow({row: {
                                                                                                                            ...r, 
                                                                                                                            structure: {...r.structure, 'Сборка': value, 'Время сборки':  new Date()},
                                                                                                                            history: r.history.length > 0 ? [...r.history, {date:  new Date(), value, profile: profile.name}] : [{date:  new Date(), value, profile: profile.name}] }})
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                            
                                                                                                            setRows([...updateRows])
                                                                                                            if(value != 'k') 
                                                                                                                document.getElementById(`input-${index+1}`)?.focus()
                                                                                                        }}
                                                                                                        classNames={{
                                                                                                            base: `w-[120px] ${row.structure['Сборка'] ? row.structure['Сборка'] == 'n' ? 'bg-[#FF0000]' : (row.structure['Сборка'] == 'y' || row.structure['Сборка'] == 'd') ? 'bg-[#92D050]': row.structure['Сборка'] == 'p' ? 'bg-[#FFC000]' : row.structure['Сборка'] == 'pallete' ? 'bg-[#3F8059]' : 'bg-transparent' : 'bg-transparent'}`
                                                                                                        }}
                                                                                                    />
                                                                                                : col.name == 'Кол-во' ? 
                                                                                                    <div className="flex w-full h-full place-items-center">
                                                                                                        <p className="w-3/4">
                                                                                                            {`${(row.structure && row.structure[col.name] ? Math.ceil(row.structure[col.name]) : '')} ${['крепёжка угол', 'крепёжка шкант', 'крепёжка евро', 'крепёжка 30', 'крепёжка 16', 'крепёжка полк', 'крепёжка гв'].includes(row.structure['Вид']) ? 'гр.' : 'шт.'}`}
                                                                                                        </p>
                                                                                                        <Tooltip content={`Разделить позицию`}>
                                                                                                            <Image
                                                                                                                shadow="none"
                                                                                                                radius="none"
                                                                                                                width="100%"
                                                                                                                className="object-cover cursor-pointer"
                                                                                                                classNames={{wrapper: "w-1/4 h-full flex flex-col-reverse"}}
                                                                                                                src={'/images/drob.png'}
                                                                                                                onClick={async () => {
                                                                                                                    let popolam = prompt('Введите количество для первой половины') as any
                                                                                                                    if(!popolam || isNaN(popolam) || popolam >= Math.ceil(row.structure[col.name])) {
                                                                                                                        alert("Недоспустимое число")
                                                                                                                        return 
                                                                                                                    }
                                                                                                                    popolam = Math.ceil(popolam)
                                                                                                                    await splittingThePosition(row, profile.name, popolam)
                                                                                                                }}
                                                                                                            />
                                                                                                        </Tooltip>
                                                                                                    </div>
                                                                                                    
                                                                                                : col.name == 'Статус' ?
                                                                                                    <p className={`${row.structure['Сборка'] ? row.structure['Сборка'] == 'n' ? 'bg-[#FF0000]' : (row.structure['Сборка'] == 'y' || row.structure['Сборка'] == 'd') ? 'bg-[#92D050]': row.structure['Сборка'] == 'p' ? 'bg-[#FFC000]' : row.structure['Сборка'] == 'pallete' ? 'bg-[#3F8059]' : 'bg-transparent' : 'bg-transparent'}`}>
                                                                                                        {row.structure['Сборка'] == 'y' ? 'Собрал' : row.structure['Сборка'] == 'n' ? 'Не собрал' : row.structure['Сборка'] == 'p' ? 'Не доложил' : row.structure['Сборка'] == 'd' ? 'Доложил' : row.structure['Сборка'] == 'pallete' ? 'На паллете' : ''}
                                                                                                    </p>
                                                                                                : col.name == 'Время сборки' ?
                                                                                                    row.history && row.history.length > 0 ? <User 
                                                                                                        avatarProps={{
                                                                                                            radius: "full",
                                                                                                            src: '',
                                                                                                            classNames: { base: 'w-6 h-6 !ml-2' }
                                                                                                        }}
                                                                                                        description={row.structure && row.structure[col.name] ? moment(row.structure[col.name]).format('DD.MM.YYYY HH:mm:ss') : ''}
                                                                                                        name={row.history && row.history.length > 0 && auths.find((a: any) => a.name == row.history[row.history.length - 1].profile) ? auths.find((a: any) => a.name == row.history[row.history.length - 1].profile).name : ''}
                                                                                                        classNames={{
                                                                                                            base: '!justify-start',
                                                                                                            name: 'text-black text-[14px] font_family_Montserrat_Medium',
                                                                                                            description: 'text-black text-[14px] font_family_Montserrat_Medium'
                                                                                                        }}
                                                                                                    >
                                                                                                    </User> : <></>
                                                                                                : col.name == 'Наименование В Центре' ?
                                                                                                    <>
                                                                                                        {   
                                                                                                            row.structure && row.structure['Ссылка'] && row.structure['Ссылка'].indexOf('http') == 0 ?
                                                                                                                <Link className="cursor-pointer text-black" showAnchorIcon href={`${row.structure && row.structure['Ссылка'] ? row.structure['Ссылка'] : '#'}`} target='blank'>
                                                                                                                    {row.structure && row.structure[col.name] ? row.structure[col.name] : ''}
                                                                                                                </Link>
                                                                                                            :
                                                                                                                row.structure && row.structure[col.name] ? row.structure[col.name] : ''
                                                                                                        }
                                                                                                    </>
                                                                                                :
                                                                                                    row.structure && row.structure[col.name] ? row.structure[col.name] : ''
                                                                                            }
                                                                                        </TableCell>
                                                                                    )
                                                                                })}
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        }
                                                        <div className="w-full flex">
                                                            <Tooltip content={`${filterOrderMy == true ? 'Показать все' : "Показать мои"}`}>
                                                                <Card 
                                                                    className="max-w-[100px] max-h-[65px] bg-transparent rounded-none cursor-pointer shadow-none !p-0"
                                                                >
                                                                    <CardHeader className="flex flex-col gap-1 !p-1">
                                                                        <Image
                                                                            alt="nextui logo"
                                                                            height={40}
                                                                            radius="none"
                                                                            src={profile.img}
                                                                            width={40}
                                                                            style={{'boxShadow': `${filterOrderMy == true ? 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px' : ''}`} as any}
                                                                            onClick={() => {
                                                                                //console.log(filterOrderMy)
                                                                                setFilterOrderMy(!filterOrderMy)
                                                                            }}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <p className="text-md text-black">{profile.name}</p>
                                                                        </div>
                                                                    </CardHeader>
                                                                </Card>
                                                            </Tooltip>
                                                            <div className="flex flex-col gap-1 m-1">
                                                                <Tooltip content={`${filterStatusOrder == 'nojob' ? 'Показать все' : "Не взяты в работу"}`} placement='right'>
                                                                    <div 
                                                                        className="min-w-[20px] min-h-[10px] bg-stone-600 cursor-pointer"
                                                                        style={{'boxShadow': `${filterStatusOrder == 'nojob' ? 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px' : ''}`} as any}
                                                                        onClick={() => {
                                                                            setFilterStatusOrder(filterStatusOrder == 'nojob' ? '' : 'nojob')
                                                                        }}
                                                                    >
        
                                                                    </div>
                                                                </Tooltip>
                                                                <Tooltip content={`${filterStatusOrder == 'job' ? 'Показать все' : "В работе"}`} placement='right'>
                                                                    <div 
                                                                        className="min-w-[20px] min-h-[10px] bg-sky-600 cursor-pointer"
                                                                        style={{'boxShadow': `${filterStatusOrder == 'job' ? 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px' : ''}`} as any}
                                                                        onClick={() => {
                                                                            setFilterStatusOrder(filterStatusOrder == 'job' ? '' : 'job')
                                                                        }}
                                                                    >
        
                                                                    </div>
                                                                </Tooltip>
                                                                <Tooltip content={`${filterStatusOrder == 'success' ? 'Показать все' : "Все позиции собраны"}`} placement='right'>
                                                                    <div 
                                                                        className="min-w-[20px] min-h-[10px] bg-green-600 cursor-pointer"
                                                                        style={{'boxShadow': `${filterStatusOrder == 'success' ? 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px' : ''}`} as any}
                                                                        onClick={() => {
                                                                            setFilterStatusOrder(filterStatusOrder == 'success' ? '' : 'success')
                                                                        }}
                                                                    >
        
                                                                    </div>
                                                                </Tooltip>
                                                                <Tooltip content={`${filterStatusOrder == 'failed' ? 'Показать все' : "Есть несобранные позиции"}`} placement='right'>
                                                                    <div 
                                                                        className="min-w-[20px] min-h-[10px] bg-red-600 cursor-pointer"
                                                                        style={{'boxShadow': `${filterStatusOrder == 'failed' ? 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px' : ''}`} as any}
                                                                        onClick={() => {
                                                                            setFilterStatusOrder(filterStatusOrder == 'failed' ? '' : 'failed')
                                                                        }}
                                                                    >
        
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                            <div className="w-full flex flex-nowrap gap-4 items-center overflow-x-auto">
                                                                {
                                                                    orders.filter((order: any) => { 
                                                                        return filterStatusOrder == 'failed' ? order.nCount > 0 :  
                                                                            filterStatusOrder == 'success' ? order.yCount == order.allCount :  
                                                                            filterStatusOrder == 'job' ? order.yCount < order.allCount && order.yCount != 0 :  
                                                                            filterStatusOrder == 'nojob' ? order.notCount == order.allCount : 
                                                                            order.allCount > 0
                                                                    }).map((order: any, index: number) => {
                                                                        return (
                                                                            order.users && order.users.length > 0 ?
                                                                                <Badge color="success" content={order.users.map((user: any) => {return auths.find((auth: any) => auth._id == user).name}).join('|')}>
                                                                                    <Button 
                                                                                        key={`btorder-${index}`}
                                                                                        color={
                                                                                            order.number == selectOrder ? 
                                                                                                "primary" 
                                                                                            : order.nCount > 0 ?
                                                                                                "danger"
                                                                                            : order.yCount == order.allCount ?
                                                                                                "success"
                                                                                            : 
                                                                                                "default"
                                                                                        } 
                                                                                        className={`
                                                                                            w-auto 
                                                                                            px-2 
                                                                                            ${(order.palleteCount == order.allCount) ? 'line-through' : ''}
                                                                                        `}
                                                                                        onClick={async (e: any) => {
                                                                                            setSelectOrder(order.number);
                                                                                            let { wsRead } = await loadRowsOfBase(excelss.find((excel1: any) => excel1.name == selectExcel.name)._id, order.number) 
                                                                                            setRows([...wsRead])
                                                                                            const newNumberOfBox = await getNumberOfBox(order.number)
                                                                                            setNumberOfBox((newNumberOfBox - 1).toString()) 
                                                                                        }}
                                                                                    >
                                                                                        {order.number}
                                                                                    </Button>
                                                                                </Badge>
                                                                            :
                                                                                <Button 
                                                                                    key={`btorder-${index}`}
                                                                                    color={
                                                                                        order.number == selectOrder ? 
                                                                                            "primary" 
                                                                                        : order.nCount > 0 ?
                                                                                            "danger"
                                                                                        : order.yCount == order.allCount ?
                                                                                            "success"
                                                                                        : 
                                                                                            "default"
                                                                                    } 
                                                                                    className={`
                                                                                        w-auto 
                                                                                        px-2
                                                                                        ${(order.palleteCount == order.allCount) ? 'line-through' : ''}
                                                                                    `}
                                                                                    onClick={async (e: any) => {
                                                                                        setSelectOrder(order.number);
                                                                                        let { wsRead } = await loadRowsOfBase(excelss.find((excel1: any) => excel1.name == selectExcel.name)._id, order.number) 
                                                                                        setRows([...wsRead])
                                                                                        const newNumberOfBox = await getNumberOfBox(order.number)
                                                                                        setNumberOfBox((newNumberOfBox - 1).toString()) 
                                                                                    }}
                                                                                >
                                                                                    {/*<div className="w-full h-full grid grid-cols-3">
                                                                                        <div className="h-full bg-white"></div>
                                                                                        <div className="h-full bg-black"></div>
                                                                                        <div className="h-full bg-white"></div>
                                                                                    </div>
                                                                                    <p className="absolute text-white">{order.number}</p>*/}
                                                                                    {order.number}
                                                                                </Button>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    </Tab>
                                            </>
                                        )
                                    })}
                                </Tabs>
                        :
                            <>
                                <Switch size="md" className="m-4" color="success" isSelected={settingGraphs} onValueChange={setSettingGraph}>
                                    {`${settingGraphs ? 'Графики по месяцам' : 'Графики по дням'}`}
                                </Switch>
                                <div className='grid grid-cols-3 gap-16'>
                                    {datas.map((data: any, index: number) => {
                                        return (
                                            <div key={`data-${index}`} className="w-full">
                                                <LineComponent options={options} data={data}/>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        }
                    </div>
                </>
                :
                <div className="bg-[#207346] min-h-3/6 h-3/6 flex gap-4 pl-4 pt-4">
                    <form 
                        onSubmit={async (e: any) => {
                            e.preventDefault();
                            const res = await signinHandler(isInvalidName || isInvalidPassword, { name, password });

                            if (!res.error)
                                setIsValid(true)
                            else {
                                alert(res.error && res.error)
                                //setErrorMessage(res.error ? res.error : res.message)
                            }
                        }}
                        className="flex flex-col w-1/4 rounded-2xl"
                    >
                        <Input
                            isInvalid={isInvalidName}
                            errorMessage={isInvalidName && "Пожалуйста, введите имя"}
                            placeholder='Введите своё имя'
                            label="Имя"
                            variant="underlined" 
                            classNames={{
                                base: 'bg-transparent'
                            }}
                            value={name ? name : ''}
                            onChange={(e: any) => { setName(e.target.value) }}
                        />
                        <Input
                            isInvalid={isInvalidPassword}
                            errorMessage={isInvalidPassword && "Поле не должно быть пустым"}
                            placeholder='Введите свой пароль'
                            label="Password"
                            variant="underlined" 
                            classNames={{
                                base: 'bg-transparent'
                            }}
                            value={password ? password : ''}
                            onChange={(e: any) => { setPassword(e.target.value) }}
                        />
                        <button 
                            className="border-[#3F8059] data-[hover=true]:!bg-[#3F8059] input-label w-1/2 mx-auto rounded-none"
                            style={{ 'boxShadow': 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px' } as any}
                        >Вход</button>
                    </form>
                </div>
            }
        </div>
    )
}