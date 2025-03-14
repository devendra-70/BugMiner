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
    const splitButton = document.getElementById('split-view');
    const resizer = document.getElementById('resizer');
    const notesArea = document.getElementById('notes-area');
    const notesEditor = document.getElementById('notes-editor');
    const codeNotesContainer = document.querySelector('.code-notes-container');

    // Initialize line numbers
    updateLineNumbers();


    // Update line numbers when typing
    codeEditor.addEventListener('input', function() {
        updateLineNumbers();
    });

    // Update line numbers when scrolling
    codeEditor.addEventListener('scroll', function() {
        lineNumbers.scrollTop = codeEditor.scrollTop;
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

    // Split view functionality
    // Replace the existing split-view click handler in script.js
    splitButton.addEventListener('click', function() {
        splitButton.classList.toggle('active');
        codeNotesContainer.classList.toggle('split-active');
        
        if (!codeNotesContainer.classList.contains('split-active')) {
            // Animation for closing the notes area
            notesArea.style.transition = 'flex 0.3s ease, width 0.3s ease';
            notesArea.style.flex = '0';
            notesArea.style.width = '0';
            codeEditor.style.transition = 'flex 0.3s ease';
            codeEditor.style.flex = '1';
            
            setTimeout(() => {
                notesArea.style.display = 'none';
                resizer.style.display = 'none';
            }, 300);
        } else {
            // Show the notes area with transition
            notesArea.style.display = 'block';
            resizer.style.display = 'block';
            
            // Give the browser a moment to register the display change
            setTimeout(() => {
                notesArea.style.transition = 'flex 0.3s ease, width 0.3s ease';
                codeEditor.style.transition = 'flex 0.3s ease';
                codeEditor.style.flex = '0.6';
                notesArea.style.flex = '0.4';
                notesArea.style.width = 'auto';
            }, 10);
        }
    });

    // Resizer functionality
    // Replace the existing resizer code in script.js with this version
    // Replace the existing resizer code in script.js with this version
    // Complete replacement for the resizer functionality
    let isResizing = false;
    let startX, startCodeWidth, startNotesWidth;

    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        
        // Get both the code editor and notes area computed styles
        const codeEditorStyle = window.getComputedStyle(codeEditor);
        const notesAreaStyle = window.getComputedStyle(notesArea);
        
        // Store both widths - important for preserving the proper ratio
        startCodeWidth = parseFloat(codeEditorStyle.width);
        startNotesWidth = parseFloat(notesAreaStyle.width);
        
        // Add a class to indicate active resizing - for styling
        resizer.classList.add('resizing');
        document.body.classList.add('no-select');
        
        // Prevent default to avoid text selection
        e.preventDefault();
    });

    // Important: Use capturing phase to ensure this handler runs first
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        // Calculate displacement
        const moveX = e.clientX - startX;
        
        // Calculate total width of the container
        const totalWidth = startCodeWidth + startNotesWidth;
        
        // Calculate new widths
        let newCodeWidth = startCodeWidth + moveX;
        let newNotesWidth = totalWidth - newCodeWidth;
        
        // Convert to percentages
        const codeWidthPercent = (newCodeWidth / totalWidth) * 100;
        const notesWidthPercent = (newNotesWidth / totalWidth) * 100;
        
        // Apply limits (minimum 20% for either side)
        if (codeWidthPercent >= 20 && notesWidthPercent >= 20) {
            codeEditor.style.flex = `0 0 ${codeWidthPercent}%`;
            notesArea.style.flex = `0 0 ${notesWidthPercent}%`;
        }
        
        // Prevent standard event behavior while resizing
        e.preventDefault();
        e.stopPropagation();
    }, { capture: true });

    // Clean up - important to handle all possible end scenarios
    function endResize() {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
            document.body.classList.remove('no-select');
        }
    }

    document.addEventListener('mouseup', endResize);
    document.addEventListener('mouseleave', endResize);

    // Also handle case where mouse leaves just the resizer
    resizer.addEventListener('mouseleave', function() {
        if (!isResizing) {
            // Only remove hover effects if we're not actively resizing
            // This keeps the resizer styled during active resize even if mouse moves away a bit
        }
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
        
        // Clear the code and ratings
        codeEditor.value = '';
        updateLineNumbers();
        codeEditor.classList.remove('blur');
        ratingContainer.innerHTML = '';
        
        // Remove any existing error message
        removeErrorMessage();
    });



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

//for dropdowns
document.addEventListener('DOMContentLoaded', function() {
    function setupDropdown(labelId, dropdownId) {
        const label = document.getElementById(labelId);
        const dropdown = document.getElementById(dropdownId);

        label.addEventListener('click', function() {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', function(event) {
            if (!label.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    setupDropdown('language-label', 'language-dropdown');
    setupDropdown('difficulty-label', 'difficulty-dropdown');
    setupDropdown('topic-label', 'topic-dropdown');
});


// Metrics Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const metricsSidebar = document.querySelector('.metrics-sidebar');
    const metricsButton = document.querySelector('.metrics-button');
    const sidebarContent = metricsSidebar.querySelector('.sidebar-content');
    const pinButton = metricsSidebar.querySelector('.pin-button');
    
    // Show sidebar on hover over metrics button
    metricsButton.addEventListener('mouseenter', function() {
        if (!metricsSidebar.classList.contains('pinned')) {
            metricsSidebar.classList.add('active');
        }
    });
    
    // Check if user is touching the leftmost edge of the screen
    document.addEventListener('mousemove', function(e) {
        // Only check for left edge if in full screen mode
        if (window.innerWidth === screen.width) {
            const edgeThreshold = 10; // pixels from the edge
            if (e.clientX <= edgeThreshold) {
                if (!metricsSidebar.classList.contains('pinned')) {
                    metricsSidebar.classList.add('active');
                }
            }
        }
    });
    
    // Hide sidebar when mouse leaves the sidebar area unless pinned
    sidebarContent.addEventListener('mouseleave', function(e) {
        if (!metricsSidebar.classList.contains('pinned')) {
            // Check if mouse is not over the metrics button
            if (!metricsButton.matches(':hover')) {
                metricsSidebar.classList.remove('active');
            }
        }
    });
    
    // Toggle pinned state on pin button click
    pinButton.addEventListener('click', function() {
        metricsSidebar.classList.toggle('pinned');
        
        // If unpinning and mouse is not over sidebar, close it
        if (!metricsSidebar.classList.contains('pinned') && 
            !sidebarContent.matches(':hover') &&
            !metricsButton.matches(':hover')) {
            metricsSidebar.classList.remove('active');
        }
    });
});

//full screen functionality.

// Full screen functionality
const fullScreenButton = document.getElementById('full-screen');
const exitFullScreenButton = document.getElementById('exit-full-screen');

fullScreenButton.addEventListener('click', function() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    
    fullScreenButton.style.display = 'none';
    exitFullScreenButton.style.display = 'inline-block';
});

exitFullScreenButton.addEventListener('click', function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    
    exitFullScreenButton.style.display = 'none';
    fullScreenButton.style.display = 'inline-block';
});

// Update button state when exiting fullscreen via ESC key
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
        exitFullScreenButton.style.display = 'none';
        fullScreenButton.style.display = 'inline-block';
    } else {
        fullScreenButton.style.display = 'none';
        exitFullScreenButton.style.display = 'inline-block';
    }
}