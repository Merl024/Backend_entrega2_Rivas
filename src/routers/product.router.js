import express from 'express';
import { productModel } from '../models/product.model.js';

const router = express.Router();

// GET - provisional 
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find()
        res.json(products);    
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// // GET / - Obtener productos con filtros, paginación y ordenamiento
// router.get('/', async (req, res) => {
//     try {
//         const page = parseInt(req.params.page) || 1
//         const limit = parseInt(req.params.limit) || 10;
//         const skip = (page - 1) * limit

//         const totalProducts = await productModel.countDocuments()
//         const totalPages = Math.ceil(totalProducts /limit)

//         const products = await productModel.find()
//            .skip(skip)
//            .limit(limit)

//         const pages =Array.from({ length: totalPages }, (_, i)=> ({
//             number: i + 1,
//             active: i + 1 === page
//         }))

//         res.render('home', {
//             products,
//             hasPrevPage: page > 1,
//             hasNextPage: page < totalPages,
//             prevPage: page - 1,
//             nextPage: page + 1,
//             pages,
//             limit
//         })
//     } catch (error) {
//         res.status(500).json({ error: 'Error al obtener productos' });
//     }
// });

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

// POST / - Agregar un nuevo producto
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
