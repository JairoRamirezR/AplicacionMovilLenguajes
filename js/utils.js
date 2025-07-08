// js/utils.js

const API_BASE_URL = 'http://localhost:5293';

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

    if (data !== null) { // Check for null explicitly, allowing empty objects or arrays
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                Swal.fire('Session Expired', 'Your session has expired or you are unauthorized. Please log in again.', 'warning');
                localStorage.removeItem('authToken'); // Clear token
                window.location.hash = '#login'; // Redirect to login
                // Throw an error to stop the promise flow in the calling function
                throw new Error('Unauthorized or session expired');
            }
            const errorText = await response.text();
            let errorData = { message: errorText };
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                // Not JSON, use plain text
            }
            throw new Error(errorData.message || `HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        // Check if the response has content before parsing as JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            // If response is not JSON, return a success object or true.
            // This is useful for endpoints that might return 200 OK with no body (e.g., logout, clear cart).
            return { success: true, message: "Operation successful." };
        }

    } catch (error) {
        console.error('Fetch request error:', error);
        // Only re-throw if it's not the specific unauthorized/session expired error
        if (error.message !== 'Unauthorized or session expired') {
            throw error;
        }
    }
}

// Function to show only the active section and hide others
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

        // Handle #details specifically as it has a query param
        const cleanedSectionId = sectionId.replace('Section', '').split('?')[0];

        if (linkHash === cleanedSectionId) {
            link.classList.add('active');
        }
    });
}

// Updated isAuthenticated function to check for the presence of the auth token
export function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}