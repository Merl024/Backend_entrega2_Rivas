import express from 'express';
import CartManager from '../managers/CartManager.js';

const router = express.Router();
const cartManager = new CartManager('./carts.json');

// GET - Obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCart(cid);
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST - Publicar un carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.postCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Publicar un producto dentro del id del carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;