import MainPageComponent from "@/components/MainPageComponent";
import Excel from "@models/excel";
import Row from "@models/rows";
import connectToDB from "@utils/database";
import { mkdir, readFile, writeFile } from "fs/promises";
import { redirect } from "next/navigation";
import { join } from "path";
import { ObjectId } from 'mongodb'
import axios from "axios";
import { cookies } from "next/headers";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { revalidateTag } from "next/cache";
import Auth from "@models/auth";

let wsRead = [] as any
let wbRead = null as any

let chats = [] as any

async function getServerSideProps() {
  'use server'

  try {
      console.log('LOAD LAYOUT EXCEL NAMES')
      await connectToDB()
      

      const cookieStore = await cookies()
      const token = cookieStore.get("token")
      //console.log({token})
      if (!token || !token.value) {
        throw({error: 'not token'})
      }

      const data = jwt.verify(token?.value as string, process.env.TOKEN_SECRET as Secret) as JwtPayload
    //console.log({data})

      const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/auth?userId=${data.userId}`)
      let auth = response.data
      auth = JSON.parse(JSON.stringify(auth))
      //console.log({ auth })
      if (!auth) {
        throw({error: 'not auth'})
      }

      let auths = await Auth.find({})
      auths = JSON.parse(JSON.stringify(auths))

      let excels = await Excel.find({},{},{sort:{_id:-1}})
      excels = JSON.parse(JSON.stringify(excels))

      let newExcels = [] as any

      for(let excel of excels) {
        let orders = await Row.aggregate([
          {
            $match: { 
              excelId: new ObjectId(excel._id), 
              $and: [{"structure.Номер заказа":{$exists:true}, "structure.Возим": true},{"structure.Номер заказа":{$ne:"Общий итог"}}] 
            }
          },
          { 
            $group: { 
              _id: "$structure.Номер заказа",
              count: { 
                $sum: 1 
              }
            }, 
          }
        ])
        orders = JSON.parse(JSON.stringify(orders))

        newExcels.push({...excel, orders})
      }

      //console.log({newExcels: JSON.stringify(newExcels)})

      return {excels: newExcels, isValid: true, auth, basicUrl: process.env.NEXTAUTH_URL, auths}

  } catch (error) {
    console.log('LOAD LAYOUT GSSP', error)
    return {isValid: false}
  }
}

const signinHandler = async (isInvalid: boolean, form: any) => {
  'use server'
  try {
    //console.log({isInvalid, form})
      if (!isInvalid) {
          const res = await axios.post(`${process.env.NEXTAUTH_URL}/api/signin`, {
              name: form.name,
              password: form.password
          })
          const data = res.data
          //console.log({ data })
          const cookieStore = await cookies()
          cookieStore.set("token", data.token, {
              maxAge: 30 * 60 * 60 * 24, // 30 day
              path: "/",
          })
          await cookies()
          cookieStore.set("user", data.userId, {
              maxAge: 30 * 60 * 60 * 24, // 30 day
              path: "/",
          })
          return (data)
      } else {
          return ({ error: 'Некорректное значение полей' })
      }
  } catch (error: any) {
      console.log(error)
      return ({ error: error['response']?.data })
  }
}

async function uploadExcelFile(data: FormData) {
  'use server'

  try {
    const file: File | null = data.get('file') as unknown as File
    if (!file) {
      throw new Error('No file uploaded')
    }

     console.log({ data })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = data.get('fileName') as string
    const nameCompany = data.get('nameCompany') as string
    const date = data.get('date') as string

    let excel = await Excel.findOne({name: fileName})

    
    await mkdir(`${process.cwd()}/public/download/`, { recursive: true }).catch(console.error);
    const path = join(process.cwd(), `/public/download/`, fileName)
    await writeFile(path, buffer)
    //console.log(`open ${path} to see the uploaded file`)
    
    if(!excel) {
      const excel = new Excel({
        name: fileName,
        for: nameCompany,
        date
      })
      const createdExcel = await excel.save()
    }

    return 0

  } catch (error) {
    // console.log(error)
    redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function getRowsExcel(name: any) {
  'use server'

  //console.log({name})
  revalidateTag('excelfiles')

  let response4 = await fetch(`${process.env.NEXTAUTH_URL}/api/getexcelfile?filename=${name}`, { next: { tags: ['excelfiles'] } })
  /*let xlsx = await response1.json()
  xlsx = JSON.parse(JSON.stringify(xlsx))*/
  //console.log({ xlsx })

  return {  }
}

function compare( a: any, b: any ) {
  if ( a.number < b.number ){
    return -1;
  }
  if ( a.number > b.number ){
    return 1;
  }
  return 0;
}

async function loadOrdersOfBase(excelId: any) {
  'use server'

  try {

    const cookieStore = await cookies()
    const user = cookieStore.get("user")
    if (!user?.value) {
        throw({error: 'not user'})
    }

    const userChatIndex = chats.findIndex((c: any) => {return c.userId == user?.value})

    if(userChatIndex != -1) {
      chats[userChatIndex] = {
        userId: user?.value,
        datetime: new Date(),
        excelId,
        orderNumber: '',
        wsRead: []
      }
    } else {
        chats.push({
          userId: user?.value,
          datetime: new Date(),
          excelId,
          orderNumber: '',
          wsRead: []
        })
    }

    let orders = await Row.aggregate([
      {
        $match: { 
          excelId: new ObjectId(excelId), 
          $and: [{"structure.Номер заказа":{$exists:true}, "structure.Возим": true},{"structure.Номер заказа":{$ne:"Общий итог"}}] 
        }
      },
      { $group: { _id: "$structure.Номер заказа" } }
    ])
    orders = JSON.parse(JSON.stringify(orders))

    let rows = await Row.find({ excelId: new ObjectId(excelId), "structure.Возим": true }, { "structure.Номер заказа": 1, "structure.Сборка": 1 })
    rows = JSON.parse(JSON.stringify(rows))
    //console.log({rows})

    let loadOrders = [] as any
    for(let order of orders) {
      const nCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && row.structure['Сборка'] == 'n'}).length
      const yCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && ['y','d','pallete'].includes(row.structure['Сборка'])}).length
      const palleteCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && row.structure['Сборка'] == 'pallete'}).length
      const notCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && !row.structure['Сборка']}).length
      const allCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id}).length

      loadOrders.push({
        number: order._id,
        users: chats.filter((c: any) => {return c.orderNumber == order._id}).map((c: any) => {return c.userId}),
        nCount,
        yCount,
        palleteCount,
        notCount,
        allCount
      })
    }

    //console.log(newOrders)
    return { loadOrders: loadOrders.sort(compare) }

  } catch (error: any) {
    console.log('loadOrdersOfBase', error)
    redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function loadRowsOfBase(excelId: any, orderNumber: any) {
  'use server'  

  try { 

    let wsRead = await Row.find({excelId: new ObjectId(excelId), 'structure.Номер заказа': orderNumber, "structure.Возим": true})
    wsRead = JSON.parse(JSON.stringify(wsRead))
    //console.log({ xlsx })

    const cookieStore = await cookies()
    const user = cookieStore.get("user")
    if (!user?.value) {
        throw({error: 'not user'})
    }

    const userChatIndex = chats.findIndex((c: any) => {return c.userId == user?.value})

    if(userChatIndex != -1) {
      chats[userChatIndex] = {
        userId: user?.value,
        datetime: new Date(),
        excelId,
        orderNumber,
        wsRead
      }
    } else {
        chats.push({
          userId: user?.value,
          datetime: new Date(),
          excelId,
          orderNumber,
          wsRead
        })
    }

    return { wsRead }

  } catch (error: any) {
    console.log('updatePage', error)
    redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function loadPositions(excelIds: any) {
  'use server'  

  try { 
    excelIds = Array.from(excelIds)
    console.log({excelIds})

    let rows = await Row.aggregate([
      {
        $match: { 
          excelId: {$in: excelIds.map((excelId: any) => {return new ObjectId(excelId)})}, 
          $and: [{"structure.Номер заказа":{$exists:true}},{"structure.Номер заказа":{$ne:"Общий итог"}}], 
          "structure.Возим": true
        }
      },
      { $group: { _id: "$structure.Наименование В Центре" } }
    ])
    rows = JSON.parse(JSON.stringify(rows))
    //console.log({rows})

    const cookieStore = await cookies()
    const user = cookieStore.get("user")
    if (!user?.value) {
        throw({error: 'not user'})
    }

    let loadRows = [] as any

    for(let row of rows) {
      let orders = await Row.aggregate([
        {
          $match: { 
            excelId: {$in: excelIds.map((excelId: any) => {return new ObjectId(excelId)})}, 
            $and: [{"structure.Номер заказа":{$exists:true}},{"structure.Номер заказа":{$ne:"Общий итог"}}],
            "structure.Наименование В Центре": row._id, "structure.Возим": true
          }
        },
        { $group: { _id: "$structure.Номер заказа" } }
      ])
      orders = JSON.parse(JSON.stringify(orders))

      let rowsAll = await Row.find({
        excelId: {$in: excelIds.map((excelId: any) => {return new ObjectId(excelId)})}, 
        $and: [{"structure.Номер заказа":{$exists:true}},{"structure.Номер заказа":{$ne:"Общий итог"}}],
        "structure.Наименование В Центре": row._id, "structure.Возим": true
      })
      rowsAll = JSON.parse(JSON.stringify(rowsAll))

      const type = rowsAll[0].structure && rowsAll[0].structure["Склад"] ? rowsAll[0].structure["Склад"] : ''
      const vid = rowsAll[0].structure && rowsAll[0].structure["Вид"] ? rowsAll[0].structure["Вид"] : ''

      const countAll =  rowsAll.reduce( function(a, b){
        return a + Number(b.structure['Кол-во']);
      }, 0)

      const countY = rowsAll.filter((row: any) => {return row.structure && row.structure['Сборка'] && ['y','d','pallete'].includes(row.structure['Сборка'])}).reduce( function(a, b){
        return a + Number(b.structure['Кол-во']);
      }, 0)

      const countN = rowsAll.filter((row: any) => {return row.structure && row.structure['Сборка'] && ['n'].includes(row.structure['Сборка'])}).reduce( function(a, b){
        return a + Number(b.structure['Кол-во']);
      }, 0)

      const countNot = rowsAll.filter((row: any) => {return row.structure && !row.structure['Сборка']}).reduce( function(a, b){
        return a + Number(b.structure['Кол-во']);
      }, 0)

      loadRows.push({
        name: row._id,
        type,
        vid,
        countOrders: orders.length,
        countAll,
        countY,
        countN,
        countNot
      })
    }

    //console.log({loadRows})

    return { loadRows }

  } catch (error: any) {
    console.log('updatePage', error)
    redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function updateExcelRow({row}:{row: any}) {
  'use server'
  //console.log('updateBotConfig', { row })

  try {
      const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/rowupdate`, {
        row
      })
      revalidateTag('excelrows')
  } catch (error: any) {
      console.log('updatePage', error)
      redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function updateRowsOfBase() {
  'use server'  

  try { 

    const cookieStore = await cookies()
    const user = cookieStore.get("user")

    let userChat = chats.find((c: any) => c.userId == user?.value)
    const userChatIndex = chats.findIndex((c: any) => {return c.userId == user?.value})
    
    //console.log({chats, userChatIndex, userChat, userId: user?.value})

    if (!user?.value) {
      throw({error: 'not user'})
    }

    await connectToDB()

    let wsRead = await Row.find({excelId: new ObjectId(userChat.excelId), $and: [{"structure.Время сборки":{$exists: true}}, {"structure.Время сборки":{$gte: userChat.datetime}}], "structure.Возим": true})
    wsRead = JSON.parse(JSON.stringify(wsRead))
    //console.log({ wsRead })

    if (wsRead && wsRead.length > 0) {
      let updateRows = [...userChat.wsRead]
      for(let newRow of wsRead) {
          const rowIndex = updateRows.findIndex((ur: any) => {return ur._id == newRow._id})
          if(rowIndex != -1)
            updateRows[rowIndex] = {...newRow}
          if(rowIndex == -1 && newRow.structure && newRow.structure["Номер заказа"] == userChat.orderNumber)
            updateRows.push(newRow)
      }

      chats[userChatIndex] = {
        ...userChat,
        datetime: new Date(+new Date() - 30 * 1000),
        wsRead: [...updateRows]
      }

      let orders = await Row.aggregate([
        {
          $match: { 
            excelId: new ObjectId(userChat.excelId), 
            $and: [{"structure.Номер заказа":{$exists:true}},{"structure.Номер заказа":{$ne:"Общий итог"}}], 
            "structure.Возим": true
          }
        },
        { $group: { _id: "$structure.Номер заказа" } }
      ])
      orders = JSON.parse(JSON.stringify(orders))
  
      let rows = await Row.find({ excelId: new ObjectId(userChat.excelId), "structure.Возим": true }, { "structure.Номер заказа": 1, "structure.Сборка": 1 })
      rows = JSON.parse(JSON.stringify(rows))
      //console.log({rows})
  
      let loadOrders = [] as any
      for(let order of orders) {
        const nCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && row.structure['Сборка'] == 'n'}).length
        const yCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && ['y','d','pallete'].includes(row.structure['Сборка'])}).length
        const palleteCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && row.structure['Сборка'] == 'pallete'}).length
        const notCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id && !row.structure['Сборка']}).length
        const allCount = rows.filter((row: any) => {return row.structure && row.structure['Номер заказа'] == order._id}).length
  
        loadOrders.push({
          number: order._id,
          users: chats.filter((c: any) => {return c.orderNumber == order._id}).map((c: any) => {return c.userId}),
          nCount,
          yCount,
          palleteCount,
          notCount,
          allCount
        })
      }

      return {wsRead: [...updateRows], loadOrders: loadOrders.sort(compare) }
    } else 
      return { wsRead: [], loadOrders: [] }

  } catch (error: any) {
    console.log('updatePage', error)
    //redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function getNumberOfBox(orderN: any) {
  'use server'  
  try { 

    const cookieStore = await cookies()
    const user = cookieStore.get("user")

    let userChat = chats.find((c: any) => c.userId == user?.value)
    
    //console.log({chats, userChatIndex, userChat, userId: user?.value})

    if (!user?.value) {
      throw({error: 'not user'})
    }

    let wsRead = await Row.find({'structure.Номер заказа': orderN, $and: [{'structure.№ коробки': {$exists: true}}, {'structure.№ коробки': {$ne: ''}}]}).sort({'structure.№ коробки': -1}).limit(1)
    wsRead = JSON.parse(JSON.stringify(wsRead))
    //console.log({ wsRead })
    
    return wsRead.length > 0 ? wsRead[0].structure['№ коробки'] + 1 : 1

  } catch (error: any) {
    console.log('updatePage', error)
    //redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function splittingThePosition(row: any, profileName: any, popolam: any) {
  'use server'
  try {
    const popolam2 = Math.ceil(row.structure['Кол-во']) - popolam

    row = {
      ...row, 
      structure: {...row.structure, 'Время сборки':  new Date(), 'Кол-во': popolam},
      history: row.history.length > 0 ? [...row.history, {date:  new Date(), value: 'drob', profile: profileName}] : [{date:  new Date(), value: 'drob', profile: profileName}] 
    }

    const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/rowupdate`, {
      row
    })

    const row2 = {
      ...row, 
      structure: {...row.structure, 'Время сборки':  new Date(), 'Кол-во': popolam2, 'Сборка': '', '№ коробки': ''},
      history: [{date:  new Date(), value: 'drob', profile: profileName}] 
    }

    const response1 = await axios.post(`${process.env.NEXTAUTH_URL}/api/rowinsert`, {
      row2
    })

    revalidateTag('excelrows')

  } catch (error: any) {
    console.log('updatePage', error)
  }
}

async function getOrdersByName(name: any) {
  'use server'  
  try { 

    const cookieStore = await cookies()
    const user = cookieStore.get("user")

    if (!user?.value) {
      throw({error: 'not user'})
    }

    let wsRead = await Row.find({'structure.Наименование В Центре': name, 'structure.Сборка':{$ne: 'y'}, "structure.Возим": true})
    wsRead = JSON.parse(JSON.stringify(wsRead))
    //console.log({ wsRead })
    
    let loadFinders = [] as any
    for(let row of wsRead) {
      let excel = await Excel.findOne({_id: new ObjectId(row.excelId)})
      loadFinders.push({
        excelName: excel.name,
        count: row.structure['Кол-во'],
        orderNum: row.structure['Номер заказа'],
        sborka: row.structure['Сборка']
      })
    }

    return loadFinders

  } catch (error: any) {
    console.log('updatePage', error)
    //redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function getExcelByName(name: any) {
  'use server'  
  try { 

    const cookieStore = await cookies()
    const user = cookieStore.get("user")

    if (!user?.value) {
      throw({error: 'not user'})
    }

    let row = await Row.findOne({'structure.Номер заказа': name},{excelId: 1})
    row = JSON.parse(JSON.stringify(row))
    //console.log({ row })
    
    let excel = (row && row.excelId) ? await Excel.findOne({_id: new ObjectId(row.excelId)}) : {}
    excel = JSON.parse(JSON.stringify(excel))

    return excel

  } catch (error: any) {
    console.log('updatePage', error)
    //redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

async function transferOrders({selectExcel, newExcel}: {selectExcel: any, newExcel: any}) {
  'use server'  
  try { 

    const cookieStore = await cookies()
    const user = cookieStore.get("user")

    if (!user?.value) {
      throw({error: 'not user'})
    }
    await connectToDB()

    let excel = await Excel.findOne({for: selectExcel.for, date: selectExcel.date, name: selectExcel.name})

    if(!newExcel.new) {
      let existExcel = await Excel.findOne({name: newExcel.name})

      console.log({existExcel})

      if(existExcel) return {success: false}

      const createdExcelObject = new Excel({
        name: newExcel.name,
        for: newExcel.for,
        date: newExcel.date
      })
      const createdExcel = await createdExcelObject.save()
      console.log({createdExcel})

      await Row.updateMany({excelId: new ObjectId(excel._id), 'structure.Номер заказа': {$in: newExcel.orders}}, {$set: {excelId: new ObjectId(createdExcel._id)}})
    } else {
      let existExcel = await Excel.findOne({name: newExcel.name})

      console.log({existExcel})

      await Row.updateMany({excelId: new ObjectId(excel._id), 'structure.Номер заказа': {$in: newExcel.orders}}, {$set: {excelId: new ObjectId(existExcel._id)}})
    } 
    
    //const [newExcel, setNewExcel] = useState({orders: [], new: false, for: '', date: '', name: ''} as any)
    return {success: true}

  } catch (error: any) {
    console.log('updatePage', error)
    //redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
  }
}

export default async function Page() {

  const props = await getServerSideProps()

  return (
    <MainPageComponent auths={props.auths} basicUrl={props.basicUrl} isValids={props.isValid} signinHandler={signinHandler} excels={props.excels} getexels={getServerSideProps} uploadExcelFile={uploadExcelFile} getRowsExcel={getRowsExcel} loadOrdersOfBase={loadOrdersOfBase} loadRowsOfBase={loadRowsOfBase} profile={props.auth} updateExcelRow={updateExcelRow} updateRowsOfBase={updateRowsOfBase} getNumberOfBox={getNumberOfBox} splittingThePosition={splittingThePosition} loadPositions={loadPositions} getOrdersByName={getOrdersByName} transferOrders={transferOrders} getExcelByName={getExcelByName}></MainPageComponent>
  );
}
