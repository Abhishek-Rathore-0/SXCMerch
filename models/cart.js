const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    },
    ProductID: {
        type: String, 
        required: true
    },
    Size: {
        type: String,
        enum: ['S','M','L','XL','XXL']
    },
    Quantity: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,0]
    }
});

// const cartSchema = new mongoose.Schema({
//     UserID: {
//         type: String,
//         required: true
//     },
//     ProductID: {
//         type: [String],
//         default: []
//     },
//     ProductCount: {
//         type: [Number],
//         default: []
//     },
//     NumberOfProducts: {
//         type: Number,
//         default: 0
//     },
//     SubTotal: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     Shipping: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     Tax: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     TotalAmount: {
//         type: Number,
//         required: true,
//         default: 0
//     }
// });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;