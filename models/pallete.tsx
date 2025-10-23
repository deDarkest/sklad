import { Schema, model, models } from "mongoose"

const PalleteSchema = new Schema({
    excelId: {
        type: Schema.Types.ObjectId,
        required: [true, 'excelId is required.'],
        ref: 'Excel',
    },
    for: {
        type: String,
        required: [true, 'for is required.']
    },
    date: {
        type: String,
        required: [true, 'date is required.']
    },
    order: {
        type: String,
        required: [true, 'order is required.']
    },
    box: {
        type: String,
        required: [true, 'box is required.']
    },
    palletenumber: {
        type: String
    },
    profile: {
        type: String
    }
}, { strict: false })

const Pallete = models.Pallete || model('Pallete', PalleteSchema)

export default Pallete