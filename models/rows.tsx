import { Schema, model, models } from "mongoose"

const RowSchema = new Schema({
    excelId: {
        type: Schema.Types.ObjectId,
        required: [true, 'excelId is required.'],
        ref: 'Excel',
    },
    sheetName: {
        type: String,
        required: [true, 'sheetName is required.']
    },
    structure: {
        type: Object,
        required: [true, 'structure is required.']
    },
    history: {
        type: Array
    }
}, { strict: false })

const Row = models.Row || model('Row', RowSchema)

export default Row