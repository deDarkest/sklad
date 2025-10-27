import Excel from '@models/excel';
import Row from '@models/rows';
import Summary from '@models/summary';
import connectToDB from '@utils/database'
import { readFile } from 'fs/promises';
import { join } from 'path';
export const dynamic = 'force-dynamic';
import * as XLSX from 'xlsx'
import { ObjectId } from 'mongodb'

const acceptedWH = ['Паллеты фурнитура', 'Гола', 'Цоколь', 'Длинномер', 'Паллеты мойки/техника', 'Отдельно стоящие', 'Столешницы/панели', 'Кромка'] as any

export const GET = async (request: Request) => {

    try {
        await connectToDB()
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')
        console.log({filename})

        const path = join(process.cwd(), `/public/download/${filename}`)
        const xlsx = await readFile(path)

        let excel = await Excel.findOne({name: filename})

        let existRow = await Row.countDocuments({excelId: excel})

        if(existRow == 0) {
            let wbRead = XLSX.read(xlsx)
            let wsRead = XLSX.utils.sheet_to_json(wbRead.Sheets['Сборка ']) as any
            ['Паллеты фурнитура', 'Паллеты мойки/техника', 'Гола', 'Цоколь', 'Длинномер', 'Отдельно стоящие', 'Столешницы/панели', 'Кромка'].map(async (sheet: any) => {
                for(let row of wsRead.filter((row: any) => {return row['Склад'] == sheet})) {
                    const newrow = new Row({
                        excelId: excel,
                        sheetName: sheet,
                        structure: {
                            'Организация': row['Организация'],
                            'Номер заказа': row['Номер заказа'],
                            'Наименование В Центре': row['Наименование В Центре'],
                            'Сборка': row['Сборка'],
                            'Вид': row['Вид'],
                            'Кол-во': row['Кол-во'],
                            'Ссылка': row['Ссылка'],
                            'Склад': row['Склад'],
                            'Комплектация': row['Комплектация'],
                            'Ячейка хранения': row['Ячейка хранения'],
                            'Возим': acceptedWH.includes(row['Склад']) ? true : false
                        },
                        history: []
                    })
                    await newrow.save()
                }
            })
            

            /*wsRead = XLSX.utils.sheet_to_json(wbRead.Sheets['Сборка МойкиТехника']) as any
            
            for(let row of wsRead) {
                const newrow = new Row({
                    excelId: excel,
                    sheetName: 'Сборка МойкиТехника',
                    structure: {
                        'Организация': row['Организация'],
                        'Номер заказа': row['Номер заказа'],
                        'Наименование В Центре': row['Наименование В Центре'],
                        'Сборка': row['Сборка'],
                        'Вид': row['Вид'],
                        'Кол-во': row['Кол-во']
                    },
                    history: []
                })
                await newrow.save()
            }

            wsRead = XLSX.utils.sheet_to_json(wbRead.Sheets['Сборка Цоколь']) as any
            
            for(let row of wsRead) {
                const newrow = new Row({
                    excelId: excel,
                    sheetName: 'Сборка Цоколь',
                    structure: {
                        'Организация': row['Организация'],
                        'Номер заказа': row['Номер заказа'],
                        'Наименование В Центре': row['Наименование В Центре'],
                        'Сборка': row['Сборка'],
                        'Вид': row['Вид'],
                        'Кол-во': row['Кол-во']
                    },
                    history: []
                })
                await newrow.save()
            }*/
        }

       /* let wbRead = XLSX.read(xlsx)
        let wsRead = XLSX.utils.sheet_to_json(wbRead.Sheets['Сводная']) as any
        
        for(let row of wsRead) {
            //console.log({row})
            const existSummary = await Summary.findOne({name: row['Наименование товара']})
            //console.log({existSummary})

            if(existSummary) {
                await Summary.updateOne({_id: new ObjectId(existSummary)},{$set:{
                    name1C: row['Номенклатура 1с'], type: row['Вид'] ? row['Вид'] : '',
                }, $push: {
                    purchasePrice: {for: excel.for, date: excel.date, price: row['Цена закуп']},
                    salePrice: {for: excel.for, date: excel.date, price: row['Цена продажа']}
                }
            })
            } else {
                const newsummary = new Summary({
                    name: row['Наименование товара'],
                    name1C: row['Номенклатура 1с'],
                    type: row['Вид'] ? row['Вид'] : '',
                    purchasePrice: [
                        {
                            for: excel.for, 
                            date: excel.date,
                            price: row['Цена закуп']
                        }
                    ],
                    salePrice: [
                        {
                            for: excel.for, 
                            date: excel.date,
                            price: row['Цена продажа']
                        }
                    ]
                })
                await newsummary.save()
            }
        }

        wbRead = XLSX.read(xlsx)
        wsRead = XLSX.utils.sheet_to_json(wbRead.Sheets['ДАННЫЕ']) as any

        const groupedCountFunction = wsRead.reduce((count: any, row: any) => {
            // Проверяем, существует ли уже ключ с таким именем
            if (!count[row['Столбец1']]) {
                count[row['Столбец1']] = { name: row['Столбец1'], quantity: 0 }
            }
            // Добавляем количество к существующему значению
            count[row['Столбец1']].quantity += row['10% шт']
            return count
        }, {});
        
        // Преобразуем объект обратно в массив
        const groupedCount = Object.values(groupedCountFunction) as any

        for(let gc of groupedCount) {
            const existSummary = await Summary.findOne({name: gc.name})
            //console.log({existSummary})

            if(existSummary) {
                await Summary.updateOne({_id: new ObjectId(existSummary)},{$push: {
                    counts: {for: excel.for, date: excel.date, count: gc.quantity}
                }
            })
            }
        }*/

        return new Response()
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}