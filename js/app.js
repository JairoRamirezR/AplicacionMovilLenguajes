// js/app.js

import { registerUser, loginUser, logoutUser, isAuthenticated } from './auth.js';
import { loadDishes, showDishDetails } from './dishes.js';
import { loadCart, updateCartIcon, confirmOrder, updateCartOnServer, removeFromCartOnServer } from './cart.js';
import { loadUserProfile, updateProfile, changePassword } from './profile.js';
import { showSection } from './utils.js';


window.showDishDetails = showDishDetails;

document.addEventListener('DOMContentLoaded', () => {
    
    const handleLocationHash = () => {
        const hash = window.location.hash;

        
        if (isAuthenticated()) {
            document.querySelector('.navbar').classList.remove('d-none');
            document.getElementById('authSection').classList.add('d-none');
        } else {
            document.querySelector('.navbar').classList.add('d-none'); 
            showSection('authSection'); 
            
            if (hash !== '#login' && hash !== '#register') {
                window.location.hash = '#login';
                return; 
            }
        }

        if (hash.startsWith('#details')) {
            if (!isAuthenticated()) { 
                window.location.hash = '#login'; 
                return;
            }
            showSection('detailsSection');
            const paramsString = hash.includes('?') ? hash.split('?')[1] : '';
            const urlParams = new URLSearchParams(paramsString);
            const dishIdParam = urlParams.get('id');

            if (dishIdParam) {
                const dishId = parseInt(dishIdParam);
                if (!isNaN(dishId)) {
                    showDishDetails(dishId);
                } else {
                    console.error("Parsed dish ID from URL is NaN. Redirecting to menu.");
                    window.location.hash = '#menu';
                }
            } else {
                console.warn("No dish ID specified in URL hash for #details. Redirecting to menu.");
                window.location.hash = '#menu';
            }
            return;
        }

        switch (hash) {
            case '#menu':
                if (!isAuthenticated()) {
                    window.location.hash = '#login';
                    return;
                }
                showSection('menuSection');
                loadDishes();
                break;
            case '#cart':
                if (!isAuthenticated()) {
                    window.location.hash = '#login';
                    return;
                }
                showSection('cartSection');
                loadCart(); 
                break;
            case '#profile':
                if (!isAuthenticated()) { 
                    window.location.hash = '#login';
                    return;
                }
                showSection('profileSection');
                loadUserProfile();
                break;
            case '#login': 
                if (isAuthenticated()) { 
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('loginForm').classList.remove('d-none');
                document.getElementById('registerForm').classList.add('d-none');
                break;
            case '#register': 
                if (isAuthenticated()) { 
                    window.location.hash = '#menu';
                    return;
                }
                showSection('authSection');
                document.getElementById('registerForm').classList.remove('d-none');
                document.getElementById('loginForm').classList.add('d-none');
                break;
            default:
              
                if (!isAuthenticated()) {
                    window.location.hash = '#login';
                } else {
                    window.location.hash = '#menu';
                }
                break;
        }
    };

    window.addEventListener('hashchange', handleLocationHash);
    handleLocationHash(); 

    
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#register';
    });

    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#login';
    });

    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await loginUser(email, password);
        
        updateCartIcon(); 
    });

    document.getElementById('registerBtn').addEventListener('click', async () => {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('registerName').value;          
        const lastName = document.getElementById('registerLastName').value; 
        const address = document.getElementById('registerAddress').value;

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Passwords do not match', 'error');
            return;
        }

        
        const success = await registerUser(email, password, name, lastName, address);
       
        if (success) {
             updateCartIcon(); 
        }
    });

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const name = document.getElementById('profileName').value;
            const lastName = document.getElementById('profileLastName').value;
            const address = document.getElementById('profileAddress').value;

            
            await updateProfile(name, lastName, address);
        });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            
            await changePassword(currentPassword, newPassword, confirmNewPassword);
        });
    }
    
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        updateCartIcon(); 
    });

    const dishSearchInput = document.getElementById('dishSearchInput');
    if (dishSearchInput) {
        dishSearchInput.addEventListener('input', () => {
            const searchTerm = dishSearchInput.value.trim();
            if (window.location.hash === '#menu') {
                loadDishes(searchTerm);
            }
        });
    }

   
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

    
    document.getElementById('confirmOrderBtn').addEventListener('click', async () => {
        await confirmOrder();
    });

    
    updateCartIcon(); 
});