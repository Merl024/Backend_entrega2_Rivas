import { Router } from 'express'
import { productModel } from '../models/product.model.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        // Obtenemos los productos desde MongoDB
        const products = await productModel.find().lean(); 
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        // Obtenemos los productos desde MongoDB
        const products = await productModel.find().lean();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

export default router;