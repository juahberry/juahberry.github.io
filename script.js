document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollUpBtn = document.getElementById('scroll-up');
    const currentYearSpan = document.getElementById('current-year');
    const allButtons = document.querySelectorAll('.btn-ripple');
    const revealElements = document.querySelectorAll('.reveal');
    const contactForm = document.getElementById('contact-form');
    const formSuccessMessage = document.getElementById('form-success');
    const formErrorMessage = document.getElementById('form-error');
    const terminalCodeElement = document.getElementById('terminal-output'); // Target the <code> element
    const terminalCursor = document.querySelector('.terminal-body .cursor'); // Target the cursor span
    const clearLogBtn = document.getElementById('clear-log-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-link');
    const header = document.querySelector('.header');

    // --- Dynamic Year ---
    if (currentYearSpan) {
        // Use the simulated date from context if available, otherwise current date
        // const now = new Date("2025-04-15T03:21:40+05:30"); // Simulated time if needed
        const now = new Date(); // Use actual current date
        currentYearSpan.textContent = now.getFullYear();
    }

    // --- Track Scroll Position for Header Shadow (Optional) ---
     const checkScrollPosition = () => {
         if (window.scrollY > 0) {
             document.body.dataset.scrollPos = 'scrolled';
         } else {
             document.body.dataset.scrollPos = '0';
         }
     };
     window.addEventListener('scroll', checkScrollPosition);
     checkScrollPosition(); // Initial check

    // --- Active Nav Link Highlighting on Scroll ---
    const activateNavLink = (id) => {
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check href attribute ending with '#' + id
            if (link.getAttribute('href').endsWith(`#${id}`)) {
                link.classList.add('active');
            }
        });
    };

    // Adjusted options for full-height sections
    const sectionObserverOptions = {
        root: null,
        // Trigger when the top of the section is 40% down from the top of the viewport
        rootMargin: `-${(window.innerHeight * 0.4)}px 0px -${(window.innerHeight * 0.6)}px 0px`,
        threshold: 0 // Trigger as soon as the margin is crossed
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateNavLink(entry.target.id);
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        // Observe only sections with an ID used for navigation
        if (section.id) {
            sectionObserver.observe(section);
        }
    });


    // --- Scroll Up Button Visibility ---
    const toggleScrollUpButton = () => {
        if (window.scrollY > window.innerHeight * 0.6) { // Show after scrolling down 60% of viewport height
            scrollUpBtn.classList.add('visible');
        } else {
            scrollUpBtn.classList.remove('visible');
        }
    };

    // Scroll to top functionality
    if (scrollUpBtn) {
        scrollUpBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent potential hash changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        // Add scroll listener check here too
        window.addEventListener('scroll', toggleScrollUpButton);
        toggleScrollUpButton(); // Initial check
    }


    // --- Reveal Elements on Scroll ---
    const revealObserverOptions = {
        root: null,
        threshold: 0.1, // Reveal when 10% is visible
        rootMargin: '0px 0px -40px 0px' // Trigger slightly before element fully enters
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                 // Optional: Stop observing once revealed
                 // observer.unobserve(entry.target);
            }
            // You might want to keep them visible once revealed for this design
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- Button Ripple Effect ---
    allButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            // Prepend ripple to ensure it's behind the text/icon
            this.insertBefore(ripple, this.firstChild);
            setTimeout(() => ripple.remove(), 600);
        });
    });


    // --- Terminal Typing Effect ---
    const terminalLines = [
        "[10:32] juah@snooze:~/bed$ sleep --duration=forever",
        "[10:35] juah@kitchen:~/oven$ cook --recipe=cake --status=burnt",
        "[10:36] system: ERROR: Kitchen smoke alarm activated. Please ventilate.",
        "[11:15] juah@couch:~/netflix$ binge --show=\"K-Drama Marathon\" --episodes=ALL",
        "[12:00] juah@park:~/dogs$ cuddle --target=\"Fluffy\" --duration=2hrs --intensity=MAX",
        "[12:05] juah@kitchen:~/fridge$ eat --food=\"mystery leftovers\" --regret=pending",
        "[13:00] juah@desk:~/reality$ check --status=avoiding",
        "[13:02] juah@snooze:~/bed$ nap --type=emergency --reason='reality check failed'",
        "[14:00] system: WARNING: Snack reserves critical. Deploy emergency chocolate.",
        "juah@dreamland:~$" // Final prompt
    ];
    let currentLineIndex = 0;
    let currentLineHTML = ''; // Store HTML of the current line being typed
    let typingTimeout;
    let isTyping = false;
    const typingSpeed = 55; // Adjusted speed
    const lineDelay = 300;

    // Helper function for syntax highlighting
    function applySyntaxHighlighting(line) {
        // Escape HTML entities first to prevent issues with code in strings
        let highlightedLine = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Define patterns carefully to avoid conflicts
        const patterns = [
            { regex: /^(ERROR:.*)$/gm, class: 'term-error', group: 1 }, // Match full ERROR lines first
            { regex: /^(WARNING:.*)$/gm, class: 'term-warning', group: 1 }, // Match full WARNING lines
            { regex: /^(system:.*)$/gm, class: 'term-system', group: 1 }, // Match full system lines
            { regex: /(".*?")/g, class: 'term-string', group: 1 }, // Match strings first
            { regex: /(--\w+(=.*?)?)/g, class: 'term-keyword', group: 1 }, // Match keywords/flags like --duration=forever
            { regex: /(juah@(?:snooze|kitchen|couch|park|desk|dreamland))/g, class: 'term-prompt', group: 1 }, // User@host
            { regex: /(:~\/?(?:bed|oven|netflix|dogs|fridge|reality)?)/g, class: 'term-path', group: 1 }, // Paths
            { regex: /(\$)\s*(sleep|cook|binge|cuddle|eat|check|nap)/g, class: 'term-command', group: 2 }, // Commands after $
        ];

        // Apply patterns - This simple replace can have issues with overlapping matches.
        // A more robust tokenizer would be needed for perfect highlighting.
        patterns.forEach(p => {
            highlightedLine = highlightedLine.replace(p.regex, (match, ...args) => {
                const groupIndex = p.group - 1; // Adjust group index
                const captured = args[groupIndex];
                // Avoid re-wrapping already wrapped parts (basic check)
                if (match.includes('<span class="')) return match;
                 // Reconstruct the match, wrapping only the captured group
                 let before = '', after = '';
                 const captureIndex = match.indexOf(captured);
                 if (captureIndex > 0) before = match.substring(0, captureIndex);
                 if (captureIndex + captured.length < match.length) after = match.substring(captureIndex + captured.length);
                return `${before}<span class="${p.class}">${captured}</span>${after}`;
            });
        });

         // Final overrides for lines starting with specific keywords
        if (line.trim().startsWith("ERROR:")) return `<span class="term-error">${highlightedLine}</span>`;
        if (line.trim().startsWith("WARNING:")) return `<span class="term-warning">${highlightedLine}</span>`;
        if (line.trim().startsWith("system:")) return `<span class="term-system">${highlightedLine}</span>`;

        return highlightedLine; // Return potentially highlighted line
    }


    const typeCharacter = () => {
        if (!terminalCodeElement || !terminalCursor) {
            isTyping = false; // Stop if elements are missing
            return;
        }

        if (currentLineIndex >= terminalLines.length) {
            isTyping = false;
            terminalCursor.style.visibility = 'visible'; // Ensure cursor is visible at the end
             // Make sure cursor is appended correctly at the end
             terminalCodeElement.appendChild(terminalCursor);
             terminalCodeElement.parentElement.scrollTop = terminalCodeElement.parentElement.scrollHeight;
            return;
        }

        const currentFullLine = terminalLines[currentLineIndex];
         // Calculate the effective text length of the currently built HTML line
         const tempDiv = document.createElement('div');
         tempDiv.innerHTML = currentLineHTML;
         const currentTextLength = tempDiv.textContent.length;

        if (currentTextLength < currentFullLine.length) {
             // Get the next character from the original plain text line
             const nextChar = currentFullLine[currentTextLength];
             // Append the character (conceptual) and re-highlight the whole line
             currentLineHTML = applySyntaxHighlighting(currentFullLine.substring(0, currentTextLength + 1));

             // Update the DOM - find the last newline and replace content after it
             const lastNewlineIndex = terminalCodeElement.innerHTML.lastIndexOf('\n');
             const beforeLastLine = lastNewlineIndex === -1 ? '' : terminalCodeElement.innerHTML.substring(0, lastNewlineIndex + 1);
             terminalCodeElement.innerHTML = beforeLastLine + currentLineHTML;

            typingTimeout = setTimeout(typeCharacter, typingSpeed);
        } else {
            // Line finished, add newline to the actual DOM and move to next line index
            terminalCodeElement.innerHTML += '\n';
            currentLineIndex++;
            currentLineHTML = ''; // Reset for next line

            typingTimeout = setTimeout(typeCharacter, lineDelay);
        }

        // Move cursor visually - append it after the code content inside the <pre>
        terminalCursor.style.visibility = 'visible'; // Make sure cursor is visible while typing
        terminalCodeElement.appendChild(terminalCursor);
        // Ensure terminal scrolls down
        const terminalBody = terminalCodeElement.parentElement;
        terminalBody.scrollTop = terminalBody.scrollHeight;
    };


    const startTyping = () => {
        if (isTyping || !terminalCodeElement || !terminalCursor) return;
        isTyping = true;
        clearTimeout(typingTimeout);
        terminalCodeElement.innerHTML = ''; // Clear previous content
        currentLineIndex = 0;
        currentLineHTML = '';
        terminalCursor.style.visibility = 'hidden'; // Hide cursor initially
        // Make sure cursor is inside the code element for JS to manage
        terminalCodeElement.appendChild(terminalCursor);
        typeCharacter();
    };

    // Observe terminal section
    const terminalSection = document.getElementById('lifelog');
    let terminalRevealed = false;
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !terminalRevealed && !isTyping) { // Check isTyping flag
                startTyping();
                terminalRevealed = true;
                 // observer.unobserve(entry.target); // Uncomment if you only want it to type once ever
            }
        });
     }, { threshold: 0.4 });
    if (terminalSection && terminalCodeElement) terminalObserver.observe(terminalSection);

    // Clear Log button
    if (clearLogBtn && terminalCodeElement) {
        clearLogBtn.addEventListener('click', () => {
            isTyping = false; // Allow restart
            clearTimeout(typingTimeout); // Stop current typing if any
            terminalRevealed = false; // Allow observer re-trigger if scrolled out/in
            terminalCodeElement.innerHTML = ''; // Clear code element
            terminalCursor.style.visibility = 'hidden'; // Hide cursor
            terminalCodeElement.appendChild(terminalCursor); // Re-add cursor to cleared element
            startTyping(); // Start immediately on click
        });
    }


    // --- Contact Form Handling (Formspree) ---
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        clearErrors();

        let isValid = true;
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // Updated Validation Messages
        if (!nameInput.value.trim()) {
            showError('name', 'Oops, did you fall asleep typing your name?');
            isValid = false;
        }
        if (!emailInput.value.trim()) {
            showError('email', 'Need an email, unless you communicate telepathically?');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
             showError('email', 'Hmm, that email looks a bit... creative. Try again?');
             isValid = false;
        }
         if (messageInput.value.trim().length < 10) {
             showError('message', 'Say a bit more! Even \'I like naps\' works (min 10 chars).');
             isValid = false;
         }

        if (!isValid) return;

        const formData = new FormData(contactForm);
        formSuccessMessage.style.display = 'none';
        formErrorMessage.style.display = 'none';
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true; // Disable button during submission
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formSuccessMessage.style.display = 'block';
                contactForm.reset();
                // Optionally hide form: contactForm.style.display = 'none';
            } else {
                 response.json().then(data => {
                    formErrorMessage.textContent = data.errors?.map(e => e.message).join(', ') || 'Oops! Something went wrong. Please try again.';
                    formErrorMessage.style.display = 'block';
                     // Highlight specific fields if Formspree provides field info
                     data.errors?.forEach(err => {
                         if(err.field) showError(err.field.replace(/^_ Messa?ge$/, 'message'), err.message); // Fix formspree field name mapping
                     });
                }).catch(() => {
                     formErrorMessage.textContent = 'Oops! An unexpected error occurred. Please try again.';
                     formErrorMessage.style.display = 'block';
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
            formErrorMessage.textContent = 'Oops! Could not connect. Check your internet?';
            formErrorMessage.style.display = 'block';
        } finally {
             submitButton.disabled = false; // Re-enable button
             submitButton.textContent = 'Send Message';
        }
    };

    const showError = (fieldId, message) => {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const fieldElement = document.getElementById(fieldId);
        if (errorElement) errorElement.textContent = message;
        if (fieldElement) fieldElement.parentElement.classList.add('has-error'); // Add error class to form-group
    };

     const clearErrors = () => {
         document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
         document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
         if(formSuccessMessage) formSuccessMessage.style.display = 'none';
         if(formErrorMessage) formErrorMessage.style.display = 'none';
     };


    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
         contactForm.querySelectorAll('input, textarea').forEach(input => {
             input.addEventListener('input', () => { // Clear error on input for that specific field
                const fieldId = input.id;
                const errorElement = document.getElementById(`${fieldId}-error`);
                 if(errorElement) errorElement.textContent = '';
                 input.parentElement.classList.remove('has-error');
             });
         });
    }

    // --- Mobile Menu Toggle ---
    const toggleMobileMenu = (forceClose = false) => {
        const isOpen = mobileMenu.classList.contains('is-open');
        if (forceClose || isOpen) {
             mobileMenu.classList.remove('is-open');
             document.body.classList.remove('menu-open'); // Allow body scroll
             mobileMenuToggle.setAttribute('aria-expanded', 'false');
             mobileMenuToggle.innerHTML = '<i class="bi bi-list"></i>'; // Change back to hamburger
        } else {
             mobileMenu.classList.add('is-open');
             document.body.classList.add('menu-open'); // Prevent body scroll
             mobileMenuToggle.setAttribute('aria-expanded', 'true');
             mobileMenuToggle.innerHTML = '<i class="bi bi-x-lg"></i>'; // Change to close icon while open
        }
    };

    if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
         mobileMenuToggle.addEventListener('click', () => toggleMobileMenu());
         mobileMenuClose.addEventListener('click', () => toggleMobileMenu(true)); // Force close

         // Close menu when a link is clicked
         mobileNavLinks.forEach(link => {
             link.addEventListener('click', () => {
                 // Add a slight delay to allow scroll animation to start before closing menu
                 setTimeout(() => {
                      toggleMobileMenu(true); // Force close
                 }, 150);
             });
         });

         // Close menu on Escape key press
          window.addEventListener('keydown', (e) => {
              if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                  toggleMobileMenu(true); // Force close
              }
          });
    }

}); // End DOMContentLoaded