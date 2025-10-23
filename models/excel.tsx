import { Schema, model, models } from "mongoose"

const ExcelSchema = new Schema({
    /*creator: {
        type: Schema.Types.ObjectId,
        required: [true, 'creator is required.'],
        ref: 'Auth',
    },*/
    name: {
        type: String,
        required: [true, 'name is required.']
    },
    for: {
        type: String,
        required: [true, 'for is required.']
    },
    date: {
        type: String,
        required: [true, 'date is required.']
    }
}, { strict: false })

const Excel = models.Excel || model('Excel', ExcelSchema)

export default Excel