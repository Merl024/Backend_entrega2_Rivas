import { Router } from 'express'
import ProductManager from '../ProductManager.js'

const router = Router()
const productManager = new ProductManager('./productos.json')

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        res.render('home', { products })
    } catch (error) {
        res.status(500).send('Error al obtener productos')
    }
})

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        res.render('realTimeProducts', { products })
    } catch (error) {
        res.status(500).send('Error al obtener productos')
    }
})

export default router