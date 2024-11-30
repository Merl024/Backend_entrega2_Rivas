import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'productos';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true }
    }, 
    {
    versionKey: false,
    timestamps: true
    }
);

// Plugin para paginación
productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection, productSchema);
