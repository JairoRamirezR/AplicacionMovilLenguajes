// js/profile.js

import { fetchData } from './utils.js';

export async function loadUserProfile() {
    try {
        const profileData = await fetchData('/api/profile'); // Your endpoint to get the profile
        document.getElementById('profileFullName').value = profileData.fullName;
        document.getElementById('profileEmail').value = profileData.email; // Email is displayed but not editable
        document.getElementById('profileAddress').value = profileData.address;
        // ... (Display other data if it exists)
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Could not load profile information.');
    }
}

export async function updateProfile(fullName, address) {
    try {
        const dataToUpdate = { fullName, address };
        await fetchData('/api/profile/update', 'PUT', dataToUpdate);
        alert('Profile updated successfully!');
        // Optional: reload profile or redirect
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
}

export async function changePassword(currentPassword, newPassword) {
    try {
        const dataToUpdate = { currentPassword, newPassword };
        await fetchData('/api/profile/changePassword', 'PUT', dataToUpdate);
        alert('Password changed successfully!');
        // Optional: redirect to login or show message
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password: ' + error.message);
    }
}