const socket = io()

// Elementos del DOM
const productForm = document.getElementById('productForm')
const productList = document.getElementById('productList')
const submitButton = document.getElementById('submitButton')

// Variables para edicion 
let editMode = false
let editingProductId = null

// Escuchar actualizaciones de productos
socket.on('products', (products) => {
    updateProductList(products)
    if (!editMode) {
        productForm.reset()
        submitButton.textContent = 'Agregar Producto'
    }
})

// Escuchar errores
socket.on('error', (error) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
    })
})

// Función para validar los campos del formulario
function validateForm(product) {
    if (!product.title || !product.description || !product.price || !product.stock || !product.category) {
        throw new Error('Todos los campos son requeridos')
    }
    if (isNaN(product.price) || product.price <= 0) {
        throw new Error('El precio debe ser un número válido mayor a 0')
    }
    if (isNaN(product.stock) || product.stock < 0) {
        throw new Error('El stock debe ser un número válido no negativo')
    }
}

// Manejar envío del formulario
productForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const product = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value.trim()
    }

    try {
        validateForm(product)
        if (editMode && editingProductId) {
            socket.emit('updateProduct', editingProductId, product);
            Swal.fire({
                icon: 'success',
                title: 'Producto actualizado',
                showConfirmButton: false,
                timer: 1500
            })
            editMode = false
            editingProductId = null
            submitButton.textContent = 'Agregar Producto'
        } else {            
            await socket.emit('newProduct', product)
            Swal.fire({
                icon: 'success',
                title: 'Producto agregado',
                showConfirmButton: false,
                timer: 1500
            })
        }
    
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message
        })
    }
})
function editProduct(productId) {
    console.log('Modo de edición activado para el producto con ID:', productId);
    editMode = true;
    editingProductId = productId; 
}

// Función para eliminar producto
function deleteProduct(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('deleteProduct', id)
        }
    })
}

// Función para preparar la edición de producto
function updateProduct(id) {
    editMode = true
    editingProductId = id
    submitButton.textContent = 'Actualizar Producto'

    // Obtener producto actual y rellenar el formulario con sus datos
    const productCard = document.querySelector(`.product-card[data-id="${id}"]`)
    if (productCard) {
        document.getElementById('title').value = productCard.querySelector('h2').textContent
        document.getElementById('description').value = productCard.querySelectorAll('p')[0].textContent.split(': ')[1]
        document.getElementById('price').value = productCard.querySelectorAll('p')[1].textContent.split('$')[1]
        document.getElementById('stock').value = productCard.querySelectorAll('p')[2].textContent.split(': ')[1]
        document.getElementById('category').value = productCard.querySelectorAll('p')[3].textContent.split(': ')[1]
        
        productForm.scrollIntoView({ behavior: 'smooth' })
    }
}

// Función para actualizar la lista de productos
function updateProductList(products) {
    productList.innerHTML = products.length === 0 
        ? '<p>No hay productos disponibles</p>'
        : products.map(product => `
            <div class="col-md-12 mb-3">
                <div class="card product-card" data-id="${product._id}">
                    <div class="card-body">
                        <h2 class="card-title">${product.title}</h2>
                        <p class="card-text">Descripción: ${product.description}</p>
                        <p class="card-text">Precio: $${product.price}</p>
                        <p class="card-text">Stock: ${product.stock}</p>
                        <p class="card-text">Categoría: ${product.category}</p>
                        <div class="btn-group">
                            <button class="btn btn-primary update-btn" onclick="updateProduct('${product._id}')">
                                Actualizar
                            </button>
                            <button class="btn btn-danger delete-btn" onclick="deleteProduct('${product._id}')">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
}
