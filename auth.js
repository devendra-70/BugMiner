document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabId}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Update icon
            const path = this.querySelector('path');
            if (type === 'text') {
                path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
            } else {
                path.setAttribute('d', 'M12 6c-3.79 0-7.17 2.13-8.82 5.5 1.65 3.37 5.03 5.5 8.82 5.5s7.17-2.13 8.82-5.5C19.17 8.13 15.79 6 12 6zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 7 12 7s4.5 2.02 4.5 4.5S14.48 16 12 16zm0-7c-1.38 0-2.5 1.12-2.5 2.5S10.62 14 12 14s2.5-1.12 2.5-2.5S13.38 9 12 9z');
            }
        });
    });
    
    // Password strength meter
    const passwordInput = document.getElementById('register-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        // Check password length
        if (password.length >= 8) {
            strength += 1;
        }
        
        // Check for mixed case
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += 1;
        }
        
        // Check for numbers
        if (password.match(/\d/)) {
            strength += 1;
        }
        
        // Check for special characters
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += 1;
        }
        
        // Update strength meter
        strengthBar.className = 'strength-bar';
        switch(strength) {
            case 0:
                strengthBar.style.width = '0%';
                strengthText.textContent = 'Password strength';
                break;
            case 1:
                strengthBar.classList.add('weak');
                strengthText.textContent = 'Weak';
                break;
            case 2:
                strengthBar.classList.add('medium');
                strengthText.textContent = 'Medium';
                break;
            case 3:
                strengthBar.classList.add('strong');
                strengthText.textContent = 'Strong';
                break;
            case 4:
                strengthBar.classList.add('very-strong');
                strengthText.textContent = 'Very Strong';
                break;
        }
    });
    
    // Form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Simulate successful login
        simulateLogin();
    });
    
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const terms = document.getElementById('terms').checked;
        
        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        if (!terms) {
            showError('Please agree to the Terms of Service');
            return;
        }
        
        // Simulate successful registration
        simulateRegistration();
    });
    
    // Helper functions
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form.active');
        
        // Remove any existing error messages
        const existingError = activeForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add the new error message
        activeForm.appendChild(errorDiv);
        
        // Remove the error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function simulateLogin() {
        const submitButton = loginForm.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        // Simulate API call
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirect to dashboard
        }, 1500);
    }
    
    function simulateRegistration() {
        const submitButton = registerForm.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';
        
        // Simulate API call
        setTimeout(() => {
            // Switch to login tab after successful registration
            document.querySelector('[data-tab="login"]').click();
            
            // Reset form and button
            registerForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Account created successfully! Please log in.';
            loginForm.appendChild(successMessage);
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }, 1500);
    }
});