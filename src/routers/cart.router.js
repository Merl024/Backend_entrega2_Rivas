import express from 'express';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();

// GET - Obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find()
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener un carrito por ID
router.get('/:cid', async (req, res) => { 
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.json({
            status: 'success',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Publicar un carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create(req.body)
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Publicar un producto dentro del id del carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Buscar el carrito por su ID
        const cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Buscar el producto por su ID
        const product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Verificar si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);

        if (productIndex !== -1) {
            // Si el producto ya existe, sumar a la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si el producto no existe, agregarlo al carrito
            cart.products.push({ product: pid, quantity: 1 });
        }

        // Guardar los cambios en el carrito
        const updatedCart = await cart.save();

        res.json({
            status: 'success',
            message: `Producto con ID ${pid} agregado/actualizado en el carrito ${cid}`,
            payload: updatedCart
        });
    } catch (error) {
        console.error('Error al agregar/actualizar producto en el carrito:', error);
        res.status(500).json({ error: 'Error al agregar/actualizar producto en el carrito' });
    }
});

// DELETE api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const productIndex = cart.products.find(item => item.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }
        cart.products.splice(productIndex, 1);
        await cart.save();
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

// PUT api/carts/:cid 
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

// AYUDA // 
// PUT api/carts/:cid/products/:pid 
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params; // ID del carrito y producto
        const { quantity } = req.body; // Nueva cantidad desde el cuerpo de la solicitud

        // Validar que se reciba una cantidad válida
        if (!quantity || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({
                error: 'La cantidad debe ser un número mayor o igual a 1.',
            });
        }

        // Buscar el carrito por su ID
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        // Buscar el producto dentro del carrito
        const productInCart = cart.products.find(
            (item) => item.product.toString() === pid // Comparar IDs como cadenas
        );

        if (!productInCart) {
            return res.status(404).json({
                error: 'El producto no existe en este carrito.',
            });
        }

        // Actualizar la cantidad del producto
        productInCart.quantity = quantity;

        // Guardar los cambios en la base de datos
        const updatedCart = await cart.save();

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

// DELETE api/carts/:cid 
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params; // Obtener el ID del carrito

        // Buscar el carrito por su ID
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Vaciar el array de productos del carrito
        cart.products = [];

        // Guardar los cambios en el carrito
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