// js/utils.js

const API_BASE_URL = 'https://localhost:7039';

export async function fetchData(url, method = 'GET', data = null) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (data !== null) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                Swal.fire('Session Expired', 'Your session has expired or you are unauthorized. Please log in again.', 'warning');
                localStorage.removeItem('authToken');
                window.location.hash = '#login';
                
                throw new Error('Unauthorized or session expired');
            }
            const errorText = await response.text();
            let errorData = { message: errorText };
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                
            }
            throw new Error(errorData.message || `HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
           
            return { success: true, message: "Operation successful." };
        }

    } catch (error) {
        console.error('Fetch request error:', error);
        
        if (error.message !== 'Unauthorized or session expired') {
            throw error;
        }
    }
}


export function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('d-none');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        targetSection.classList.add('active-section');
    } else {
        console.warn(`Section with ID "${sectionId}" not found.`);
    }

    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        const linkHash = link.getAttribute('href') ? link.getAttribute('href').substring(1) : '';

        
        const cleanedSectionId = sectionId.replace('Section', '').split('?')[0];

        if (linkHash === cleanedSectionId) {
            link.classList.add('active');
        }
    });
}


export function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}