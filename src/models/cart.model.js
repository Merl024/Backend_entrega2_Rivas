import mongoose from "mongoose";

// Hacer la conexion a la coleccion donde quiero guardar las carts
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
}, { // Ocultar de la vista a la version
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v; 
            return ret;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            delete ret.__v; 
            return ret;
        }
    }
});

// Middleware para hacer populate de los productos al consultar el carrito
cartSchema.pre('findOne', function (next) {
    this.populate('products.product');
    next();
});

// Crear el modelo de carrito
export const cartModel = mongoose.model(cartCollection, cartSchema);
