const mongoose = require('mongoose');

const merchSchema = new mongoose.Schema({
    pName: {
        type: String,
        required: true
    },
    pPrice: {
        type: Number,
        required: true
    },
    pImage: {
        type: String,
        required: true
    },
    pDescription: {
        type: String,
        required: true
    },
    pCategory: {
        type: String,
        enum: ['tshirt','hoodie','cap','mask','brooch']
    }
});

const Product = mongoose.model('Product', merchSchema);

module.exports = Product;