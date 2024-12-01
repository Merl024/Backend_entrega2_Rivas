import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Conexion con la coleccion 'productos' 
const productCollection = 'productos';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true }
    }, 
    {
    // Ocultar la version
    versionKey: false,
    timestamps: true
    }
);

// Plugin para paginación
productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection, productSchema);
