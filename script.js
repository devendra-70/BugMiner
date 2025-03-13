document.addEventListener('DOMContentLoaded', function() {
    const codeEditor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');
    const submitButton = document.getElementById('submit-button');
    const nextButton = document.getElementById('next-button');
    const ratingContainer = document.getElementById('rating-container');
    const resetButton = document.getElementById('reset-code');
    const languageSelect = document.getElementById('language');
    const difficultySelect = document.getElementById('difficulty');
    const buttonSelect = document.getElementById('button');
    const allSelects = [languageSelect, difficultySelect, buttonSelect];

    // Initialize line numbers
    updateLineNumbers();

    // Create language tags container
    const languageSelectContainer = languageSelect.parentElement.parentElement;
    const languageTagsContainer = document.createElement('div');
    languageTagsContainer.className = 'language-tags';
    languageSelectContainer.appendChild(languageTagsContainer);

    // Add event listeners to labels to trigger dropdowns
    document.getElementById('language-label').addEventListener('click', function() {
    languageSelect.click();
});
document.getElementById('difficulty-label').addEventListener('click', function() {
    difficultySelect.click();
});
document.getElementById('button-label').addEventListener('click', function() {
    buttonSelect.click();
});

    // Ensure dropdowns appear on top of everything when focused
    allSelects.forEach(select => {
        select.addEventListener('focus', function() {
            this.style.zIndex = '1000';
            this.style.opacity = '1';
            this.style.visibility = 'visible';
        });
        select.addEventListener('blur', function() {
            setTimeout(() => {
                this.style.zIndex = '1';
                this.style.opacity = '0';
                this.style.visibility = 'hidden';
            }, 200); // Delay to allow selection before hiding
        });
    });

    // Handle multiple select language dropdown
    languageSelect.addEventListener('change', function(e) {
        updateLanguageTags();
    });

    // Initialize language tags
    updateLanguageTags();

    // Update line numbers when typing
    codeEditor.addEventListener('input', function() {
        updateLineNumbers();
    });

    // Update line numbers when scrolling
    codeEditor.addEventListener('scroll', function() {
        lineNumbers.scrollTop = codeEditor.scrollTop;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        // Check if the click is outside any select element
        const isClickOutsideSelects = !Array.from(allSelects).some(select => 
            select.contains(e.target) || select.parentElement.contains(e.target) || 
            (select.previousElementSibling && select.previousElementSibling.contains(e.target))
        );
        
        if (isClickOutsideSelects) {
            // Blur (close) all select elements
            allSelects.forEach(select => {
                select.blur();
                select.style.opacity = '0';
                select.style.visibility = 'hidden';
            });
        }
    });

    // Prevent dropdown from showing options list when clicked
    allSelects.forEach(select => {
        select.addEventListener('mousedown', function(e) {
            if (select.multiple) {
                // For multiple select, we need to handle differently
                e.preventDefault();
                this.focus();
                
                // Toggle the selection of the option that was clicked
                if (e.target.tagName === 'OPTION') {
                    e.target.selected = !e.target.selected;
                    // Trigger change event
                    const event = new Event('change');
                    this.dispatchEvent(event);
                }
            }
        });
    });

    // Reset code
    resetButton.addEventListener('click', function() {
        codeEditor.value = '';
        updateLineNumbers();
        resetButton.classList.add('pulse');
        setTimeout(() => {
            resetButton.classList.remove('pulse');
        }, 500);
        
        // Remove any existing error message
        removeErrorMessage();
        
        // Remove blur effect and rating buttons if present
        codeEditor.classList.remove('blur');
        ratingContainer.innerHTML = '';
    });

    // Submit code
    submitButton.addEventListener('click', function() {
        // Remove any existing error message
        removeErrorMessage();
        
        if (codeEditor.value.trim() === '') {
            // Show error message if code is empty
            showErrorMessage('Empty code. Please write some code before submitting.');
        } else {
            // Apply blur effect to code editor
            codeEditor.classList.add('blur');
            
            // Show rating buttons
            showRatingButtons();
        }
    });

    // Next button functionality
    nextButton.addEventListener('click', function() {
        // Add animation to next button
        nextButton.classList.add('pulse');
        setTimeout(() => {
            nextButton.classList.remove('pulse');
        }, 500);
        
        // For now, just clear the code and ratings
        codeEditor.value = '';
        updateLineNumbers();
        codeEditor.classList.remove('blur');
        ratingContainer.innerHTML = '';
        
        // Remove any existing error message
        removeErrorMessage();
    });

    // Function to update language tags
    function updateLanguageTags() {
        languageTagsContainer.innerHTML = '';
        
        const selectedOptions = Array.from(languageSelect.selectedOptions);
        
        if (selectedOptions.length > 0) {
            selectedOptions.forEach(option => {
                const tag = document.createElement('div');
                tag.className = 'language-tag';
                tag.dataset.value = option.value;
                tag.innerHTML = `${option.text} <span class="remove">&times;</span>`;
                
                // Add click handler for removal
                tag.querySelector('.remove').addEventListener('click', function() {
                    option.selected = false;
                    updateLanguageTags();
                });
                
                languageTagsContainer.appendChild(tag);
            });
        }
    }

    // Function to update line numbers
    function updateLineNumbers() {
        const lines = codeEditor.value.split('\n');
        const count = lines.length;
        
        let lineNumbersHtml = '';
        for (let i = 1; i <= count; i++) {
            lineNumbersHtml += `<div>${i}</div>`;
        }
        
        // Ensure there's always at least one line number
        if (count === 0) {
            lineNumbersHtml = '<div>1</div>';
        }
        
        lineNumbers.innerHTML = lineNumbersHtml;
    }

    // Function to show rating buttons
    function showRatingButtons() {
        ratingContainer.innerHTML = '';
        
        const ratings = [
            { label: 'Very Easy', class: 'very-easy' },
            { label: 'Easy', class: 'easy' },
            { label: 'Medium', class: 'medium' },
            { label: 'Hard', class: 'hard' },
            { label: 'Very Hard', class: 'very-hard' }
        ];
        
        ratings.forEach((rating, index) => {
            const button = document.createElement('button');
            button.textContent = rating.label;
            button.className = `rating-button ${rating.class}`;
            button.style.opacity = '0';
            button.style.transform = 'translateY(10px)';
            
            button.addEventListener('click', function() {
                // Hide all rating buttons and remove blur effect
                setTimeout(() => {
                    ratingContainer.innerHTML = '';
                    codeEditor.classList.remove('blur');
                }, 300);
            });
            
            ratingContainer.appendChild(button);
            
            // Stagger the animations
            setTimeout(() => {
                button.style.transition = 'all 0.3s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 50 * index);
        });
    }

    // Function to show error message
    function showErrorMessage(message) {
        // Create error message container if it doesn't exist
        if (!document.querySelector('.error-message')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <span>${message}</span>
            `;
            
            document.querySelector('.code-container').appendChild(errorDiv);
            
            // Activate the error message with a slight delay
            setTimeout(() => {
                errorDiv.classList.add('active');
            }, 10);
            
            // Remove error after 5 seconds
            setTimeout(() => {
                removeErrorMessage();
            }, 5000);
        }
    }

    // Function to remove error message
    function removeErrorMessage() {
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.classList.remove('active');
            setTimeout(() => {
                errorMessage.remove();
            }, 300);
        }
    }
});

// Updated History Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const historySidebar = document.querySelector('.history-sidebar');
    const historyButton = document.querySelector('.history-button');
    const sidebarContent = document.querySelector('.sidebar-content');
    const pinButton = document.querySelector('.pin-button');
    
    // Show sidebar on hover over history button
    historyButton.addEventListener('mouseenter', function() {
        if (!historySidebar.classList.contains('pinned')) {
            historySidebar.classList.add('active');
        }
    });
    
    // Check if user is touching the rightmost edge of the screen
    document.addEventListener('mousemove', function(e) {
        // Only check for right edge if in full screen mode
        if (window.innerWidth === screen.width) {
            const edgeThreshold = 10; // pixels from the edge
            if (e.clientX >= window.innerWidth - edgeThreshold) {
                if (!historySidebar.classList.contains('pinned')) {
                    historySidebar.classList.add('active');
                }
            }
        }
    });
    
    // Hide sidebar when mouse leaves the sidebar area unless pinned
    sidebarContent.addEventListener('mouseleave', function(e) {
        if (!historySidebar.classList.contains('pinned')) {
            // Check if mouse is not over the history button
            if (!historyButton.matches(':hover')) {
                historySidebar.classList.remove('active');
            }
        }
    });
    
    // Toggle pinned state on pin button click
    pinButton.addEventListener('click', function() {
        historySidebar.classList.toggle('pinned');
        
        // If unpinning and mouse is not over sidebar, close it
        if (!historySidebar.classList.contains('pinned') && 
            !sidebarContent.matches(':hover') &&
            !historyButton.matches(':hover')) {
            historySidebar.classList.remove('active');
        }
    });
    
    // Add click event to history items (for demonstration)
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            // For demonstration - would load the selected code
            console.log('Selected history item:', this.querySelector('.history-title').textContent);
            
            // Highlight the selected item
            historyItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});