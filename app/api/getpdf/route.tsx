import Excel from '@models/excel';
import connectToDB from '@utils/database'
import { readFile } from 'fs/promises';
import { join } from 'path';
export const dynamic = 'force-dynamic';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ObjectId } from 'mongodb'
import Row from '@models/rows';
import qr from 'qrcode'
import { createCanvas } from 'canvas';
import * as https from 'https'

function expandShortLink() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://clck.ru/3FVYVe', { method: 'HEAD' }, (res) => {
            // Итоговый URL будет в заголовке `location` или `res.url`
            const finalUrl = res.headers.location || 'https://clck.ru/3FVYVe';
            resolve(finalUrl);
        });

        req.on('error', (e) => {
            reject(`Error expanding short link: ${e.message}`);
        });

        req.end();
    });
}

export const GET = async (request: Request) => {

    try {
        await connectToDB()
        const { searchParams } = new URL(request.url)
        let box = searchParams.get('box') as any
        box = JSON.parse(box)

        let excel = await Excel.findOne({_id: new ObjectId(box.excelId)})

        let row = await Row.findOne({excelId: new ObjectId(box.excelId), "structure.Номер заказа": box.selectOrder, 'structure.№ коробки': box.numBox})
        row = JSON.parse(JSON.stringify(row))

      /*  let rows = await Row.find({excelId: new ObjectId(box.excelId), 'structure.Номер заказа': box.selectOrder, 'structure.№ коробки': box.numBox})
        rows = JSON.parse(JSON.stringify(rows))
        rows = rows.map((row: any) => {
            return {'Наименование': row.structure['Наименование В Центре'], 'Кол-во': row.structure['Кол-во']}
        })*/

        let stringForQR = JSON.stringify({
            excelId: box.excelId,
            orderNum: box.selectOrder,
            numBox: box.numBox,
         //   rows
        })

       const finalUrl =  await expandShortLink() as any
        console.log('Original URL:', decodeURIComponent(decodeURIComponent(finalUrl)))

        const path = join(process.cwd(), `/public/pdf/шаблон.pdf`)
        const dataFile = await readFile(path)

        const existingPdfBytes = await toArrayBuffer(dataFile)

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const path2 = join(process.cwd(), `/fonts`, `Montserrat-Light.ttf`)
        const fontBytes = await readFile(path2) as any
        const path3 = join(process.cwd(), `/fonts`, `Montserrat-Bold.ttf`)
        const fontBytesBold = await readFile(path3) as any

        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(Buffer.from(fontBytes));
        const customFontBold = await pdfDoc.embedFont(Buffer.from(fontBytesBold));

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const mm = (v: number) => (v * 72) / 25.4;

        // 10×10 см
        const LABEL_W = mm(100);
        const LABEL_H = mm(100);

        // ВАЖНО: теперь страница реально 10×10
        firstPage.setSize(LABEL_W, LABEL_H);

        // обновим width/height после setSize
        const width = firstPage.getWidth();
        const height = firstPage.getHeight();

        /*ВАРИАНТ С МАЛЕНЬКИМ КУАРОМ*/
        const response1 = await fetch(`https://clck.ru/--?url=${encodeURI(`${process.env.NEXTAUTH_URL}/unbox?stringForQR=${stringForQR}`)}`)
        let expandedUrl = await response1.text()

        const qrFileUrl = await qrCreate(expandedUrl)

        const pngImageBytes = await fetch(qrFileUrl).then((res) => res.arrayBuffer());

        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const pngDims = pngImage.scale(0.5)

        const margin = mm(5);

        // размеры шрифта меньше, чем 36
        const labelSize = 10;
        const valueSize = 14;

        let y = height - margin - valueSize; // старт сверху

        const drawRow = (label: string, value: string) => {
        firstPage.drawText(label, {
            x: margin,
            y,
            size: labelSize,
            font: customFont,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(value, {
            x: mm(45), // колонка значений
            y: y - 1,
            size: valueSize,
            font: customFontBold,
            color: rgb(0, 0, 0),
        });

        y -= mm(12); // шаг строки
        };

        drawRow('дата', excel.date);

        drawRow(
        'орг',
        (row.structure['Организация'] && row.structure['Организация'] !== ''
            ? row.structure['Организация'].split(' ООО')[0]
            : excel.for == 'АВРОРА 25-26'
            ? 'МЕБЕЛЬ'
            : excel.for == 'Импульс Мебель'
            ? 'Импульс'
            : excel.for) as string
        );

        drawRow('заказ', box.selectOrder);
        drawRow('место', box.numBox.toString());

        const qrSize = mm(35);

        firstPage.drawImage(pngImage, {
            x: width - margin - qrSize,
            y: margin,
            width: qrSize,
            height: qrSize,
        });

        const pdfBytes = await pdfDoc.save() as any

        return new Response(pdfBytes)
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}

async function toArrayBuffer(buffer: any) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
}

async function qrCreate(stringForQR: any) {
    'use server'

    //console.log(`https://t.me/${botInfo.result.username}/?start=ref_firstaction`)
    const canvas = createCanvas(260, 260)
    //console.log({ canvas })
    qr.toCanvas(
        canvas,
        `${stringForQR}`,
        {
            errorCorrectionLevel: "L",
            margin: 0,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
            width: 260
        }
    )

    const dataURL = canvas.toDataURL("image/png")

    return dataURL

}