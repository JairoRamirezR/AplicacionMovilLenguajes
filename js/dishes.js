// js/dishes.js

import { fetchData } from './utils.js';
import { addToCart } from './cart.js';

const BACKEND_IMAGE_BASE_URL = 'http://localhost:5293';

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export async function loadDishes(searchTerm = '') {
    try {
        const response = await fetchData('/Customer/Home/GetAll');
        let dishes = response.data;
        const dishListContainer = document.getElementById('dishList');
        dishListContainer.innerHTML = '';

        if (dishes && dishes.length > 0) {
            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                dishes = dishes.filter(dish => {
                    const cleanDescription = stripHtml(dish.description);
                    return dish.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                           cleanDescription.toLowerCase().includes(lowerCaseSearchTerm);
                });
            }

            if (dishes.length > 0) {
                dishes.forEach(dish => {
                    const dishElement = document.createElement('div');
                    dishElement.className = 'card mb-3';
                    dishElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text">Price: ${dish.price.toFixed(2)}</p>
                            <button class="btn btn-info btn-sm view-details-btn" data-dish-id="${dish.id}">View Details</button>
                        </div>
                    `;
                    dishListContainer.appendChild(dishElement);
                });

                document.querySelectorAll('.view-details-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const dishId = parseInt(event.target.dataset.dishId);
                        window.location.hash = `#details?id=${dishId}`;
                    });
                });
            } else {
                dishListContainer.innerHTML = '<p>No dishes found matching your search.</p>';
            }

        } else {
            dishListContainer.innerHTML = '<p>No dishes available.</p>';
        }
    } catch (error) {
        console.error('Error loading dishes:', error);
        alert('Could not load dishes.');
    }
}

export async function showDishDetails(dishId) {
    try {
        const response = await fetchData(`/Customer/Home/Get/${dishId}`);
        const dish = response.dish;
        let imageUrlToDisplay = `${BACKEND_IMAGE_BASE_URL}${dish.imageURL}`;

        if (dish) {
            const detailsContainer = document.getElementById('dishDetails');
            detailsContainer.innerHTML = `
                <h2>${dish.name}</h2>
                <img src="${imageUrlToDisplay}" class="img-fluid mb-3" style="max-height: 200px;" alt="${dish.name}">
                <p><strong>Price:</strong> ${dish.price.toFixed(2)}</p>
                <p><strong>Description:</strong> ${stripHtml(dish.description)}</p> <button class="btn btn-success add-to-cart-btn"
                        data-dish-id="${dish.id}"
                        data-dish-name="${dish.name}"
                        data-dish-price="${dish.price}">Add to Cart</button>
                <button class="btn btn-secondary" onclick="window.location.hash = '#menu'">Back to Menu</button>
            `;

            document.querySelector('.add-to-cart-btn').addEventListener('click', (event) => {
                const btn = event.target;
                const id = parseInt(btn.dataset.dishId);
                const name = btn.dataset.dishName;
                const price = parseFloat(btn.dataset.dishPrice);
                addToCart(id, name, price, 1);
            });

        } else {
            alert('Dish not found.');
        }
    } catch (error) {
        console.error('Error loading dish details:', error);
        alert('Could not load dish details.');
    }
}