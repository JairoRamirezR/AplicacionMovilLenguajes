
import { fetchData } from './utils.js';


export async function addToCart(dishId, dishName, dishPrice, quantity = 1) {
    try {
        const response = await fetchData('/Customer/Cart/AddToCart', 'POST', {
            dishId: dishId,
            dishName: dishName, 
            dishPrice: dishPrice, 
            quantity: quantity
        });

        if (response.success) {
            toastr.success(response.message);
            updateCartIcon(); 
     
        } else {
            toastr.error(response.message);
            if (response.redirectUrl) {
                
                setTimeout(() => { window.location.href = response.redirectUrl; }, 1000);
            }
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        toastr.error("An error occurred while adding to cart. Please try again.");
    }
}


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
        updateCartIcon(); 
    } catch (error) {
        console.error("Error fetching cart data:", error);
        toastr.error("Error loading cart. Please try again.");
    }
}


export async function updateCartOnServer(dishId, newQuantity) {
    try {
        const response = await fetchData('/Customer/Cart/UpdateCart', 'POST', {
            dishId: dishId,
            quantity: newQuantity
        });

        if (response.success) {
            toastr.success(response.message);
            await loadCart(); 
            updateCartIcon();
        } else {
            toastr.error(response.message);
        }
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        toastr.error("Error updating item quantity. Please try again.");
    }
}


export async function removeFromCartOnServer(dishId) {
    try {
        
        const response = await fetchData('/Customer/Cart/RemoveFromCart', 'POST', dishId);

        if (response.success) {
            toastr.info(response.message);
            await loadCart(); 
            updateCartIcon();
        } else {
            toastr.error(response.message);
        }
    } catch (error) {
        console.error("Error removing item from cart:", error);
        toastr.error("Error removing item. Please try again.");
    }
}


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
      
    }
}


export async function confirmOrder() {
    try {
       

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
           
            const placeOrderResponse = await fetchData('/Customer/Cart/PlaceOrder', 'POST', {}); 

            if (placeOrderResponse.success) {
                
                updateCartIcon(); 

                await Swal.fire({
                    title: 'Order Placed!',
                    text: placeOrderResponse.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                window.location.hash = '#menu'; 
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