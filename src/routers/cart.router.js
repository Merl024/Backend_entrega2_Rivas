import express from 'express';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();

// GET - Obtener TODOS los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find()
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:cid - Obtener un carrito por ID
router.get('/:cid', async (req, res) => { 
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no existente' });
        }
        res.json({
            status: 'success',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el carrito' });
    }
});

// POST - Publicar un carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create(req.body)
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar el carrito' });
    }
});

// POST /:cid/product/:pid - Publicar un producto (por id) dentro del id del carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        const updatedCart = await cart.save();

        res.json({
            status: 'success',
            message: `Producto con ID ${pid} agregado/actualizado en el carrito ${cid}`,
            payload: updatedCart
        });
    } catch (error) {
        console.error('Error al agregar producto en el carrito:', error);
        res.status(500).json({ error: 'Error al agregar producto en el carrito' });
    }
});

// // DELETE api/carts/:cid/products/:pid - elimina el producto seleccionado del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json({
            status: 'success',
            message: `Producto con ID ${pid} eliminado del carrito ${cid}`,
            cart
        });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
});



// PUT api/carts/:cid  - Actualiza el carrito YA CREADO. Pues se puede actualizar agregando mas productos
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'El cuerpo debe contener un arreglo de productos.' });
        }
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }
        for (const item of products) {
            const productExists = await productModel.findById(item.product);
            if (!productExists) {
                return res.status(404).json({
                    error: `El producto con ID ${item.product} no existe.`,
                });
            }
        }
        cart.products = products;
        const updatedCart = await cart.save();
        res.json({
            status: 'success',
            message: 'El carrito ha sido actualizado con los nuevos productos.',
            payload: updatedCart,
        });
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).json({ error: 'Error al actualizar el carrito.' });
    }
});

// PUT api/carts/:cid/products/:pid - Actualizar la cantidad de un producto ya creado
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({
                error: 'La cantidad debe ser un número mayor o igual a 1.',
            });
        }
        const updatedCart = await cartModel.findOneAndUpdate(
            { _id: cid, 'products.product': pid },
            { $set: { 'products.$.quantity': quantity } },
            { new: true, runValidators: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ error: 'Carrito o producto no encontrado.' });
        }

        res.json({
            status: 'success',
            message: 'Cantidad actualizada correctamente.',
            payload: updatedCart,
        });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto:', error);
        res.status(500).json({
            error: 'Error al actualizar la cantidad del producto.',
        });
    }
});

// DELETE api/carts/:cid - elemina TODOS los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params; 

        // Buscar el carrito por su ID
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        cart.products = [];
        const updatedCart = await cart.save();
        res.json({
            status: 'success',
            message: 'Todos los productos han sido eliminados del carrito.',
            payload: updatedCart,
        });
    } catch (error) {
        console.error('Error al eliminar los productos del carrito:', error);
        res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
});

export default router;