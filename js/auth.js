// js/auth.js

import { fetchData } from './utils.js';

export async function registerUser(email, password, name, lastName, address) { 
    try {
        
        const userData = {
            email: email,
            password: password,
            name: name,         
            lastName: lastName, 
            address: address
        };
        const response = await fetchData('/api/account/register', 'POST', userData);

        if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            window.location.hash = '#menu';
            toastr.success('Registration successful! You are now logged in.'); 
            return true;
        } else {
            
            toastr.warning('Registration successful, but no token received immediately. Please try logging in.' );
            window.location.hash = '#login';
            return true;
        }

    } catch (error) {
        console.error('Error registering user:', error);
        
        if (error.errors && Array.isArray(error.errors)) {
            error.errors.forEach(err => toastr.error(err));
        } else {
            toastr.error('Error registering: ' + (error.message || 'Unknown error')); 
        }
        return false;
    }
}

export async function loginUser(email, password) { 
    try {
        const credentials = { email, password };
    
        const response = await fetchData('/api/account/login', 'POST', credentials); 

        
        if (response && response.token) {
            localStorage.setItem('authToken', response.token); 
            
            window.location.hash = '#menu';
            console.log('Login successful and token saved.');
            return true;
        } else {
            
            window.location.hash = '#menu';
            console.log('Login successful (assuming cookie authentication).');
            return true;
        }
    } catch (error) {
        console.error('Error logging in:', error);
        Swal.fire('Error', 'Error logging in: ' + (error.message || 'Unknown error'), 'error'); 
        return false;
    }
}

export function logoutUser() { 
    localStorage.removeItem('authToken'); 
    window.location.hash = '#login'; 
    console.log('Logged out.');
}

export function isAuthenticated() { 
    return localStorage.getItem('authToken') !== null;
}