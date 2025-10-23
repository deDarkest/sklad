import { Schema, model, models } from "mongoose"

const SummarySchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required.']
    },
    name1C: {
        type: String,
        required: [true, 'name1C is required.']
    },
    type: {
        type: String
    },
    purchasePrice: {
        type: Array
    },
    salePrice: {
        type: Array
    },
    counts: {
        type: Array
    }
}, { strict: false })

const Summary = models.Summary || model('Summary', SummarySchema)

export default Summary