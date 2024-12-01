import express from 'express';
import { productModel } from '../models/product.model.js';

const router = express.Router();

// GET - trae los productos por paginacion y muetra un json segun las indicaciones.
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; 
        
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const totalProducts = await productModel.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limitNumber);
        const skip = (pageNumber - 1) * limitNumber; 

        // Traer los productos para la página actual
        const products = await productModel.find()
            .skip(skip)
            .limit(limitNumber);

        // Generando los links prevLink y nextLink
        const baseUrl = req.baseUrl + req.path;
        const prevLink = pageNumber > 1 ? `${baseUrl}?page=${pageNumber - 1}&limit=${limitNumber}` : null;
        const nextLink = pageNumber < totalPages ? `${baseUrl}?page=${pageNumber + 1}&limit=${limitNumber}` : null;

        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage: pageNumber > 1 ? pageNumber - 1 : null,
            nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
            page: pageNumber,
            hasPrevPage: pageNumber > 1,
            hasNextPage: pageNumber < totalPages,
            prevLink,
            nextLink
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// GET /:pid - Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST - Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = await productModel.create(req.body);
        res.status(201).json({ message: 'Producto agregado exitosamente', newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// PUT /:pid - Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado exitosamente', updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});


// DELETE /:pid - Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
