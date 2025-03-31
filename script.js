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
    
    // History for undo/redo functionality
    let codeHistory = [''];
    let currentPosition = 0;
    let typingTimer;
    let lastLength = 0;
    const TYPING_DELAY = 800; // ms delay before considering typing "complete"
    
    // Replace BugMiner logo with navigation buttons
    const logoDiv = document.querySelector('.logo');
    if (logoDiv) {
        logoDiv.innerHTML = `
            <div class="navigation-buttons">
                <button id="undo-button" class="nav-button disabled" title="Undo">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" fill="currentColor"/>
                    </svg>
                </button>
                <button id="redo-button" class="nav-button disabled" title="Redo">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        `;
    }
    
    // Add undo/redo buttons functionality
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    
    // Implement undo functionality
    undoButton.addEventListener('click', function() {
        if (currentPosition > 0) {
            currentPosition--;
            codeEditor.value = codeHistory[currentPosition];
            updateLineNumbers();
            updateUndoRedoButtons();
        }
    });
    
    // Implement redo functionality
    redoButton.addEventListener('click', function() {
        if (currentPosition < codeHistory.length - 1) {
            currentPosition++;
            codeEditor.value = codeHistory[currentPosition];
            updateLineNumbers();
            updateUndoRedoButtons();
        }
    });
    
    // Update undo/redo buttons state
    function updateUndoRedoButtons() {
        undoButton.classList.toggle('disabled', currentPosition <= 0);
        redoButton.classList.toggle('disabled', currentPosition >= codeHistory.length - 1);
    }
    
    // Save code state for undo/redo when typing
    codeEditor.addEventListener('input', function() {
        // Clear the timeout if it's been set
        if (typingTimer) {
            clearTimeout(typingTimer);
        }
        
        // Get the current content length
        const currentLength = codeEditor.value.length;
        
        // Check if the change is significant
        const isSignificantChange = isSignificantTextChange(lastLength, currentLength);
        
        // If it's a significant immediate change (paste, cut, delete line), save now
        if (isSignificantChange) {
            saveCurrentState();
        } else {
            // Otherwise wait for typing to complete
            typingTimer = setTimeout(function() {
                // Only save if content has changed from the last save
                if (currentPosition >= 0 && 
                    codeEditor.value !== codeHistory[currentPosition]) {
                    saveCurrentState();
                }
            }, TYPING_DELAY);
        }
        
        // Update the last known length
        lastLength = currentLength;
        
        // Always update line numbers
        updateLineNumbers();
    });
    
    // Detect keypresses that typically cause significant changes
    codeEditor.addEventListener('keydown', function(e) {
        // Detect Enter, Tab, Backspace on empty line, multi-line delete, etc.
        if (e.key === 'Enter' || e.key === 'Tab' || 
            (e.key === 'Backspace' && isCursorAtLineStart()) || 
            (e.key === 'Delete' && isCursorAtLineEnd()) ||
            ((e.metaKey || e.ctrlKey) && (
                e.key === 'v' || // Paste
                e.key === 'x' || // Cut
                e.key === 'z' || // Undo
                e.key === 'y'    // Redo
            ))) {
            // Complete the current typing session
            if (typingTimer) {
                clearTimeout(typingTimer);
            }
            
            // Only save if content has changed from the last save
            if (currentPosition >= 0 && 
                codeEditor.value !== codeHistory[currentPosition]) {
                saveCurrentState();
            }
        }
    });
    
    // Check if cursor is at line start
    function isCursorAtLineStart() {
        const cursorPos = codeEditor.selectionStart;
        const valueUpToCursor = codeEditor.value.substring(0, cursorPos);
        return valueUpToCursor.endsWith('\n') || cursorPos === 0;
    }
    
    // Check if cursor is at line end
    function isCursorAtLineEnd() {
        const cursorPos = codeEditor.selectionStart;
        const value = codeEditor.value;
        return cursorPos === value.length || value.charAt(cursorPos) === '\n';
    }
    
    // Check if the change is significant 
    function isSignificantTextChange(oldLength, newLength) {
        // Detect paste or cut operations (significant length changes)
        const lengthDiff = Math.abs(oldLength - newLength);
        return lengthDiff > 10; // Arbitrary threshold for significant change
    }
    
    // Save the current state
    function saveCurrentState() {
        // If we made a change from a position other than the end of history,
        // remove all future states (similar to how a real editor works)
        if (currentPosition < codeHistory.length - 1) {
            codeHistory = codeHistory.slice(0, currentPosition + 1);
        }
        
        // Add the new state to history
        currentPosition++;
        codeHistory.push(codeEditor.value);
        
        // Limit history size 
        if (codeHistory.length > 50) { // Reduced from 100 since we track bigger changes
            codeHistory.shift();
            currentPosition--;
        }
        
        updateUndoRedoButtons();
    }
    
    // Add explicit undo/redo keyboard shortcuts
    codeEditor.addEventListener('keydown', function(e) {
        // Detect Ctrl+Z or Command+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (currentPosition > 0) {
                currentPosition--;
                codeEditor.value = codeHistory[currentPosition];
                updateLineNumbers();
                updateUndoRedoButtons();
            }
        }
        
        // Detect Ctrl+Y or Command+Shift+Z for redo
        if ((e.ctrlKey && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)) {
            e.preventDefault();
            if (currentPosition < codeHistory.length - 1) {
                currentPosition++;
                codeEditor.value = codeHistory[currentPosition];
                updateLineNumbers();
                updateUndoRedoButtons();
            }
        }
    });

    // Add download button to notes area - floating version
    if (notesArea) {
        // Create floating download button
        const downloadButton = document.createElement('button');
        downloadButton.id = 'download-notes';
        downloadButton.className = 'floating-download-button';
        downloadButton.title = 'Download Notes';
        downloadButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" fill="currentColor"/>
            </svg>
        `;
        
        // Hide by default
        downloadButton.style.opacity = '0';
        downloadButton.style.pointerEvents = 'none';
        
        // Add to notes area
        notesArea.appendChild(downloadButton);
        
        // Show button when typing in notes
        notesEditor.addEventListener('input', function() {
            if (notesEditor.value.trim() !== '') {
                downloadButton.style.opacity = '1';
                downloadButton.style.pointerEvents = 'auto';
            } else {
                downloadButton.style.opacity = '0';
                downloadButton.style.pointerEvents = 'none';
            }
        });
        
        // Show button when notes already has content
        if (notesEditor.value.trim() !== '') {
            downloadButton.style.opacity = '1';
            downloadButton.style.pointerEvents = 'auto';
        }
        
        // Add download functionality
        downloadButton.addEventListener('click', function() {
            downloadNotes();
        });
    }
    
    // Function to download notes
    function downloadNotes() {
        if (!notesEditor || !notesEditor.value) {
            // No notes to download
            return;
        }
        
        // Direct download as TXT
        const noteContent = notesEditor.value;
        const blob = new Blob([noteContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.txt';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Update split view functionality to handle the notes header
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
            { label: 'Very Easy', class: 'very-easy', dots: 5 },
            { label: 'Easy', class: 'easy', dots: 4 },
            { label: 'Medium', class: 'medium', dots: 3 },
            { label: 'Hard', class: 'hard', dots: 2 },
            { label: 'Very Hard', class: 'very-hard', dots: 1 }
        ];
        
        ratings.forEach((rating, index) => {
            const button = document.createElement('button');
            button.textContent = rating.label;
            button.className = `rating-button ${rating.class}`;
            button.style.opacity = '0';
            button.style.transform = 'translateY(10px)';
            
            button.addEventListener('click', function() {
                // Show the rating dots in top bar
                showRatingDots(rating.class, rating.dots);
                
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

    // Function to show rating dots in the top bar
    function showRatingDots(ratingClass, numberOfDots) {
        // Create a container for the dots if it doesn't exist
        let dotsContainer = document.querySelector('.rating-dots-container');
        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'rating-dots-container';
            document.querySelector('.top-bar').appendChild(dotsContainer);
        } else {
            dotsContainer.innerHTML = '';
        }
        
        // Create the dots
        for (let i = 0; i < numberOfDots; i++) {
            const dot = document.createElement('div');
            dot.className = `rating-dot ${ratingClass}-dot`;
            dotsContainer.appendChild(dot);
        }
        
        // Show the dots immediately
        requestAnimationFrame(() => {
            dotsContainer.classList.add('show');
            
            // Fade out after exactly 2 seconds
            setTimeout(() => {
                dotsContainer.classList.remove('show');
                
                // Clean up after transition completes
                setTimeout(() => {
                    dotsContainer.innerHTML = '';
                }, 300);
            }, 2000);
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

// Sidebar Functionality - UPDATED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Create and add an edge trigger element for better detection
    const edgeTrigger = document.createElement('div');
    edgeTrigger.className = 'edge-trigger';
    document.body.appendChild(edgeTrigger);
    
    // Get sidebar elements
    const historySidebar = document.querySelector('.history-sidebar');
    const sidebarContent = document.querySelector('.sidebar-content');
    const pinButton = document.querySelector('.pin-button');
    
    // Create a proper header with Statistics title if it doesn't exist
    if (!document.querySelector('.sidebar-title')) {
        const sidebarHeader = document.querySelector('.sidebar-header');
        const titleElement = document.createElement('h3');
        titleElement.className = 'sidebar-title';
        titleElement.textContent = 'Statistics';
        
        // Insert before the pin button
        sidebarHeader.insertBefore(titleElement, sidebarHeader.firstChild);
    }
    
    // Show sidebar when hovering over the edge trigger
    edgeTrigger.addEventListener('mouseenter', function() {
        if (!historySidebar.classList.contains('pinned')) {
            historySidebar.classList.add('active');
        }
    });
    
    // Also check for mouse position near right edge of screen
    document.addEventListener('mousemove', function(e) {
        const edgeThreshold = 10; // pixels from the edge
        if (e.clientX >= window.innerWidth - edgeThreshold) {
            if (!historySidebar.classList.contains('pinned')) {
                historySidebar.classList.add('active');
            }
        }
    });
    
    // Hide sidebar when mouse leaves the sidebar area unless pinned
    sidebarContent.addEventListener('mouseleave', function() {
        if (!historySidebar.classList.contains('pinned')) {
            historySidebar.classList.remove('active');
        }
    });
    
    // Toggle pinned state on pin button click (without width adjustment)
    pinButton.addEventListener('click', function() {
        historySidebar.classList.toggle('pinned');
        
        // If unpinning and mouse is not over sidebar, close it
        if (!historySidebar.classList.contains('pinned') && 
            !sidebarContent.matches(':hover')) {
            historySidebar.classList.remove('active');
        }
        
        // Update body class for CSS selectors
        if (historySidebar.classList.contains('pinned')) {
            document.body.classList.add('sidebar-pinned');
        } else {
            document.body.classList.remove('sidebar-pinned');
        }
    });
    
    // Add click event to history items
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
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        // Only proceed if sidebar is active but not pinned
        if (historySidebar.classList.contains('active') && 
            !historySidebar.classList.contains('pinned')) {
            
            // Check if click is outside sidebar
            if (!sidebarContent.contains(event.target) && 
                !edgeTrigger.contains(event.target)) {
                historySidebar.classList.remove('active');
            }
        }
    });
});

//for dropdowns
document.addEventListener('DOMContentLoaded', function() {
    function setupDropdown(labelId, dropdownId) {
        const label = document.getElementById(labelId);
        const dropdown = document.getElementById(dropdownId);

        if (!label || !dropdown) return;

        label.addEventListener('click', function(event) {
            // Toggle current dropdown
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
                label.classList.remove('active');
            } else {
                // Close all other dropdowns first
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
                
                // Remove active class from all labels
                document.querySelectorAll('.dropdown-label').forEach(lbl => {
                    lbl.classList.remove('active');
                });
                
                // Add active class to current label
                label.classList.add('active');
                
                // Position dropdown to avoid viewport overflow
                positionDropdown(dropdown);
                
                dropdown.style.display = 'block';
                event.stopPropagation(); // Prevent immediate closing
            }
        });

        document.addEventListener('click', function(event) {
            if (!label.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
                label.classList.remove('active');
            }
        });
        
        // Handle dropdown item selection
        dropdown.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function() {
                // You can store the selected value if needed
                const value = this.getAttribute('data-value');
                
                // Update label text with selection if desired
                // label.textContent = this.textContent;
                
                // Close dropdown
                dropdown.style.display = 'none';
                label.classList.remove('active');
            });
        });
    }
    
    // Function to properly position dropdowns
    function positionDropdown(dropdown) {
        // Reset any previous positioning
        dropdown.style.left = '';
        dropdown.style.right = '';
        
        // Get dropdown parent and its position
        const parent = dropdown.parentElement;
        const rect = parent.getBoundingClientRect();
        
        // Check if dropdown would overflow to the right
        const dropdownWidth = 160; // Match the CSS width
        
        if (rect.left + dropdownWidth > window.innerWidth) {
            // Position from right edge if it would overflow
            dropdown.style.left = 'auto';
            dropdown.style.right = '0';
        } else {
            // Default position from left
            dropdown.style.left = '0';
            dropdown.style.right = 'auto';
        }
        
        // Optional: Check for bottom overflow too
        const dropdownHeight = dropdown.scrollHeight;
        if (rect.bottom + dropdownHeight > window.innerHeight) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = '100%';
        }
    }

    setupDropdown('language-label', 'language-dropdown');
    setupDropdown('difficulty-label', 'difficulty-dropdown');
    setupDropdown('topic-label', 'topic-dropdown');
    
    // Handle window resize to reposition open dropdowns
    window.addEventListener('resize', function() {
        const openDropdown = document.querySelector('.dropdown-menu[style*="display: block"]');
        if (openDropdown) {
            positionDropdown(openDropdown);
        }
    });
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

//profile bar

document.addEventListener('DOMContentLoaded', function() {
    // Profile bar functionality
    const profileBar = document.querySelector('.profile-bar');
    const profileLeft = document.querySelector('.profile-left');
    
    profileLeft.addEventListener('click', function() {
        profileBar.classList.toggle('expanded');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!profileBar.contains(event.target) && profileBar.classList.contains('expanded')) {
            profileBar.classList.remove('expanded');
        }
    });
    
    // Prevent the document click handler from firing when clicking inside the profile bar
    profileBar.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Menu item click functionality
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Clicked:', this.textContent);
            // Add actual functionality for each menu item here
            
            // Close the menu after a slight delay
            setTimeout(() => {
                profileBar.classList.remove('expanded');
            }, 300);
        });
    });
});

//logout
document.addEventListener('DOMContentLoaded', function() {
    // Get the logout menu item
    const logoutMenuItem = document.querySelector('.profile-menu .menu-item:nth-child(2)');
    
    // Add click event listener to the logout menu item
    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', function() {
            // Simulate logout process
            performLogout();
        });
    }
    
    // Function to handle logout
    function performLogout() {
        // You could clear any session data here
        // For example:
        // localStorage.removeItem('user');
        // sessionStorage.removeItem('token');
        
        // Redirect to the auth page
        window.location.href = 'auth.html';
    }
});

// Add this function at the end of the file
document.addEventListener('DOMContentLoaded', function() {
    // Get the main elements we need to adjust
    const container = document.querySelector("body > div.app-layout > div.container");
    const historySidebar = document.querySelector('.history-sidebar');
    const pinButton = document.querySelector('.pin-button');
    
    if (container && historySidebar && pinButton) {
        // Define a simple resize function that only affects the container
        function resizeContainer() {
            if (historySidebar.classList.contains('pinned')) {
                container.style.width = 'calc(100% - 300px)';
                container.style.marginRight = '300px';
            } else {
                container.style.width = '100%';
                container.style.marginRight = '0';
            }
        }
        
        // Add event listener to pin button
        pinButton.addEventListener('click', function() {
            // Let a slight delay for classList toggle to complete
            setTimeout(resizeContainer, 0);
        });
        
        // Call on initial load
        resizeContainer();
        
        // Watch for changes in pinned state through attribute mutations
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    historySidebar.classList.contains('pinned') !== container.classList.contains('sidebar-active')) {
                    resizeContainer();
                }
            });
        });
        
        // Start observing
        observer.observe(historySidebar, {
            attributes: true
        });
        
        // Handle resize events
        window.addEventListener('resize', resizeContainer);
        
        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', resizeContainer);
        document.addEventListener('webkitfullscreenchange', resizeContainer);
        document.addEventListener('mozfullscreenchange', resizeContainer);
        document.addEventListener('MSFullscreenChange', resizeContainer);
    }
});