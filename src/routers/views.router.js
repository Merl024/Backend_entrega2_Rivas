import { Router } from 'express'
import { productModel } from '../models/product.model.js'
import { cartModel } from '../models/cart.model.js';

const router = Router()

router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, category } = req.query;

        // Crear filtro si se busca por categoría
        const query = category ? { category } : {};

        // Configuración de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
            lean: true, 
        };

        // Obtener productos paginados
        const products = await productModel.paginate(query, options);
        res.render('home', {
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            currentPage: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            limit: products.limit,
        });
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

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        // Convertimos el resultado a un objeto plano
        const cart = await cartModel.findById(cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.render('carts', {
            payload: cart,
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

export default router;