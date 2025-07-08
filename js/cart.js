// js/cart.js

// Importamos la función fetchData del archivo utils.js para manejar todas las solicitudes AJAX
import { fetchData } from './utils.js';

// Función para añadir un plato al carrito
export async function addToCart(dishId, dishName, dishPrice, quantity = 1) {
    try {
        const response = await fetchData('/Customer/Cart/AddToCart', 'POST', {
            dishId: dishId,
            dishName: dishName, // Aunque el backend podría ignorarlo y tomarlo de la DB, lo enviamos para consistencia.
            dishPrice: dishPrice, // Ídem.
            quantity: quantity
        });

        if (response.success) {
            toastr.success(response.message);
            updateCartIcon(); // Actualiza el contador del carrito en la UI
            // Opcional: Podrías no redirigir inmediatamente, o dar más control al usuario
            // setTimeout(() => { window.location.hash = '#menu'; }, 1000); // Redirige al menú principal después de un tiempo
        } else {
            toastr.error(response.message);
            if (response.redirectUrl) {
                // Si el backend indica una redirección (ej. a login por falta de autenticación)
                setTimeout(() => { window.location.href = response.redirectUrl; }, 1000);
            }
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        toastr.error("An error occurred while adding to cart. Please try again.");
    }
}

// Función para renderizar el carrito, obteniendo siempre los datos del servidor
export async function loadCart() {
    try {
        const data = await fetchData('/Customer/Cart/GetCartData', 'GET');
        let cart = data.cartItems || [];
        let subtotal = 0;

        let tbodyDesktop = $('#cart-table-body-desktop');
        let divMobile = $('#cart-list-body-mobile');

        tbodyDesktop.empty();
        divMobile.empty();

        if (cart.length === 0) {
            $('#empty-cart-message').show();
            $('#continue-shopping-empty-cart').show();
            $('#cart-summary-card').hide();
            return;
        } else {
            $('#empty-cart-message').hide();
            $('#continue-shopping-empty-cart').hide();
            $('#cart-summary-card').show();
        }

        cart.forEach(item => {
            let itemSubtotal = item.quantity * item.dishPrice;
            subtotal += itemSubtotal;

            let rowDesktop = `
                <tr>
                    <td>${item.dishName}</td>
                    <td class="text-center">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary decrement-quantity" data-dish-id="${item.dishId}">-</button>
                            <input type="number" class="form-control text-center quantity-input" value="${item.quantity}" min="1" data-dish-id="${item.dishId}" readonly>
                            <button class="btn btn-outline-secondary increment-quantity" data-dish-id="${item.dishId}">+</button>
                        </div>
                    </td>
                    <td class="text-end">${item.dishPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td class="text-end total-item-price">${itemSubtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td class="text-center">
                        <button class="btn btn-danger btn-sm remove-item" data-dish-id="${item.dishId}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbodyDesktop.append(rowDesktop);

            let itemMobile = `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${item.dishName}</h5>
                            <button class="btn btn-danger btn-sm remove-item" data-dish-id="${item.dishId}">
                                <i class="bi bi-trash"></i> Remove
                            </button>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            Unit Price:
                            <span class="fw-bold">${item.dishPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            Quantity:
                            <div class="input-group input-group-sm w-auto">
                                <button class="btn btn-outline-secondary decrement-quantity" data-dish-id="${item.dishId}">-</button>
                                <input type="number" class="form-control text-center quantity-input" value="${item.quantity}" min="1" data-dish-id="${item.dishId}" readonly style="max-width: 50px;">
                                <button class="btn btn-outline-secondary increment-quantity" data-dish-id="${item.dishId}">+</button>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center border-top pt-2">
                            Subtotal:
                            <strong class="total-item-price">${itemSubtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong>
                        </div>
                    </div>
                </div>
            `;
            divMobile.append(itemMobile);
        });

        $('#cart-subtotal').text(subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        $('#cart-total').text(subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        updateCartIcon(); // Asegura que el ícono se actualice después de renderizar el carrito
    } catch (error) {
        console.error("Error fetching cart data:", error);
        toastr.error("Error loading cart. Please try again.");
    }
}

// Función para actualizar la cantidad de un item en el carrito en el servidor
async function updateCartOnServer(dishId, newQuantity) {
    try {
        const response = await fetchData('/Customer/Cart/UpdateCart', 'POST', {
            dishId: dishId,
            quantity: newQuantity
        });

        if (response.success) {
            toastr.success(response.message);
            await loadCart(); // Re-renderiza el carrito completo para reflejar los cambios
            updateCartIcon();
        } else {
            toastr.error(response.message);
        }
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        toastr.error("Error updating item quantity. Please try again.");
    }
}

// Función para remover un item del carrito en el servidor
async function removeFromCartOnServer(dishId) {
    try {
        const response = await fetchData('/Customer/Cart/RemoveFromCart', 'POST', dishId); // Enviamos el ID directamente

        if (response.success) {
            toastr.info(response.message);
            await loadCart(); // Re-renderiza el carrito completo
            updateCartIcon();
        } else {
            toastr.error(response.message);
        }
    } catch (error) {
        console.error("Error removing item from cart:", error);
        toastr.error("Error removing item. Please try again.");
    }
}

// Función para actualizar el número en el ícono del carrito
export async function updateCartIcon() {
    try {
        const data = await fetchData('/Customer/Cart/GetCartData', 'GET');
        let cart = data.cartItems || [];
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.textContent = totalItems;
        }
    } catch (error) {
        console.error("Error updating cart icon:", error);
        // Opcional: Puedes manejar el error, ej. establecer el ícono a 0 o dejarlo como está
    }
}

// Función para confirmar el pedido
export async function confirmOrder() {
    try {
        const data = await fetchData('/Customer/Cart/GetCartData', 'GET'); // Obtener el estado actual del carrito desde el servidor
        let cartItems = data.cartItems || [];

        if (cartItems.length === 0) {
            toastr.warning("Your cart is empty. Please add some dishes before proceeding to checkout!");
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Order',
            text: "Are you sure you want to place this order?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, place order!'
        });

        if (result.isConfirmed) {
            const placeOrderResponse = await fetchData('/Customer/Cart/PlaceOrder', 'POST', cartItems); // Enviar los datos del carrito del servidor

            if (placeOrderResponse.success) {
                // Si el pedido se colocó con éxito, limpiar el carrito en el servidor
                await fetchData('/Customer/Cart/ClearCart', 'POST');
                updateCartIcon(); // Actualizar el ícono después de limpiar

                await Swal.fire({
                    title: 'Order Placed!',
                    text: placeOrderResponse.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                window.location.hash = '#menu'; // Redirigir al menú principal
            } else {
                if (placeOrderResponse.redirectUrl) {
                    toastr.error(placeOrderResponse.message);
                    setTimeout(() => { window.location.href = placeOrderResponse.redirectUrl; }, 1000);
                } else {
                    toastr.error(placeOrderResponse.message || "Error processing your order.");
                }
            }
        }
    } catch (error) {
        console.error("Error placing order:", error);
        toastr.error("An error occurred while trying to process your order. Please try again.");
    }
}

// --- Event Listeners para la interacción del carrito ---
// Estos listeners deben ser globales o manejados en app.js después de que el DOM esté cargado.
// Aquí los incluimos para que los copies a tu app.js o te asegures de que estén presentes.
$(document).on('click', '.increment-quantity', function () {
    let dishId = parseInt($(this).data('dish-id'));
    let quantityInput = $(`input.quantity-input[data-dish-id="${dishId}"]`);
    let currentQuantity = parseInt(quantityInput.val());
    updateCartOnServer(dishId, currentQuantity + 1);
});

$(document).on('click', '.decrement-quantity', function () {
    let dishId = parseInt($(this).data('dish-id'));
    let quantityInput = $(`input.quantity-input[data-dish-id="${dishId}"]`);
    let currentQuantity = parseInt(quantityInput.val());
    if (currentQuantity > 1) {
        updateCartOnServer(dishId, currentQuantity - 1);
    } else {
        removeFromCartOnServer(dishId);
    }
});

$(document).on('click', '.remove-item', function () {
    let dishId = parseInt($(this).data('dish-id'));
    removeFromCartOnServer(dishId);
});

// Nota: El botón 'proceed-to-checkout-btn' y la llamada a loadCart en DOMContentLoaded
// deben manejarse en app.js para mantener la modularidad.
// Asegúrate de importar estas funciones en app.js y conectarlas a los eventos de UI.