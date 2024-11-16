import express from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = express.Router();
const productManager = new ProductManager('./productos.json');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// GET product by ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductsById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        await productManager.agregarProductos(newProduct);
        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// PUT update product
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = req.body;
        const result = await productManager.updateProduct(req.params.pid, updatedProduct);
        if (result) {
            res.json({ message: 'Producto actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
})

// DELETE product
router.delete('/:pid', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.pid);
        if (result) {
            res.json({ message: 'Producto eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;