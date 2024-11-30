import mongoose from "mongoose";

const cartCollection = 'carts'

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'productos', 
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 
    }
});

// Definir el esquema de carrito
const cartSchema = new mongoose.Schema({
    products: {
        type: [cartItemSchema], 
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

// Middleware para hacer populate de los productos al consultar el carrito
cartSchema.pre('findOne', function (next) {
    this.populate('products.product');
    next();
});

// Crear el modelo de carrito
export const cartModel = mongoose.model(cartCollection, cartSchema);
