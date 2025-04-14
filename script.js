/**
 * Personalized Website Script for Juah
 * Includes: Navigation, Scroll Effects, Terminal Animation, Form Handling, Ripple Effect, Bubble Animation
 * Current as of: Tuesday, April 15, 2025 at 2:34 AM IST
 */

/*=============== DOM Element Selection ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close'),
      navLinks = document.querySelectorAll('.nav__link'),
      header = document.getElementById('header'),
      sections = document.querySelectorAll('section[data-section]'),
      scrollUpBtn = document.getElementById('scroll-up'),
      contactForm = document.getElementById('contact-form'),
      terminalOutput = document.getElementById('terminal-output'),
      terminalCursor = document.getElementById('terminal-cursor'),
      clearTerminalBtn = document.getElementById('clear-terminal-btn'),
      currentYearSpan = document.getElementById('current-year'),
      allButtons = document.querySelectorAll('.button'),
      bubbleContainer = document.querySelector('.home__bubbles'); // Select bubble container

/*=============== UTILITY: THROTTLE FUNCTION ===============*/
// Limits how often a function can be called. Useful for scroll/resize events.
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/*=============== MENU SHOW/HIDDEN (Mobile) ===============*/
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

if (navClose && navMenu) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== REMOVE MENU MOBILE ON LINK CLICK ===============*/
function linkAction() {
    if (navMenu && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
    }
}
navLinks.forEach(n => n.addEventListener('click', linkAction));

/*=============== CHANGE BACKGROUND HEADER (Optional Shadow) ===============*/
function scrollHeader() {
    if (!header) return;
    if (window.scrollY >= 80) {
        header.classList.add('scroll-header');
    } else {
        header.classList.remove('scroll-header');
    }
}
window.addEventListener('scroll', throttle(scrollHeader, 100));


/*=============== SHOW SCROLL UP BUTTON ===============*/
function scrollUp() {
    if (!scrollUpBtn) return;
    if (window.scrollY >= 350) {
        scrollUpBtn.classList.add('show-scroll');
    } else {
        scrollUpBtn.classList.remove('show-scroll');
    }
}
window.addEventListener('scroll', throttle(scrollUp, 200));

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
function scrollActive() {
    if (sections.length === 0 || navLinks.length === 0) return;

    const scrollY = window.pageYOffset;
    const triggerTop = window.innerHeight * 0.25;
    const triggerBottom = window.innerHeight * 0.75;

    let currentActiveSectionId = null;

    sections.forEach(current => {
        const sectionTop = current.offsetTop;
        const sectionHeight = current.offsetHeight;
        const sectionId = current.getAttribute('id');

        if (scrollY + triggerTop >= sectionTop && scrollY + triggerBottom <= sectionTop + sectionHeight) {
            currentActiveSectionId = sectionId;
        }
    });

     if (!currentActiveSectionId && scrollY < window.innerHeight * 0.5) {
         currentActiveSectionId = 'home';
     }

    navLinks.forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
            link.classList.add('active-link');
        }
    });
}
window.addEventListener('scroll', throttle(scrollActive, 150));


/*=============== SCROLL REVEAL ANIMATION ===============*/
const revealElements = document.querySelectorAll('[data-reveal]');

if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || '0';
                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}


/*=============== TERMINAL LIFE LOG ANIMATION ===============*/
const logEntries = [
    { time: "10:32", user: "juah@snooze", path: "~/bed", command: "sleep", args: "--duration=forever", isError: false },
    { time: "10:35", user: "juah@kitchen", path: "~/oven", command: "cook", args: "--recipe=cake --status=burnt", isError: false },
    { time: "10:36", user: "system", path: "", command: "ERROR: Kitchen smoke alarm activated.", args: "Please ventilate.", isError: true },
    { time: "11:15", user: "juah@couch", path: "~/netflix", command: "binge", args: '--show="K-Drama Marathon" --episodes=ALL', isError: false },
    { time: "12:00", user: "juah@park", path: "~/dogs", command: "cuddle", args: '--target="Fluffy" --duration=2hrs --intensity=MAX', isError: false },
    { time: "12:05", user: "juah@kitchen", path: "~/fridge", command: "eat", args: '--food="mystery leftovers" --regret=pending', isError: false },
    { time: "13:00", user: "juah@desk", path: "~/reality", command: "check", args: "--status=avoiding", isError: false },
    { time: "13:02", user: "juah@snooze", path: "~/bed", command: "nap", args: "--type=emergency --reason='reality check failed'", isError: false },
    { time: "14:00", user: "system", path: "", command: "WARNING: Snack reserves critical.", args: "Deploy emergency chocolate.", isError: false },
]; //

let currentLogIndex = 0;
let currentCharacterIndex = 0;
let currentLogElement = null;
let typingInterval = null;
let logDelayTimeout = null;
const typingSpeed = 40;
const logDelay = 1200;

function formatLogEntryHTML(entry) {
    if (entry.isError) {
        return `<span class="error">[${entry.time}] ${entry.command} ${entry.args}</span>`;
    }
    return `<span class="timestamp">[${entry.time}]</span> <span class="userhost">${entry.user}:${entry.path}$</span> <span class="command">${entry.command}</span> <span class="argument">${entry.args}</span>`;
} //

function typeLogEntry() {
    if (!terminalOutput || currentLogIndex >= logEntries.length) {
        if(terminalCursor) terminalCursor.style.display = 'inline-block';
        clearInterval(typingInterval);
        clearTimeout(logDelayTimeout);
        return;
    }

    const entry = logEntries[currentLogIndex]; //
    const fullLogStringFormatted = formatLogEntryHTML(entry); //

    if(terminalCursor) terminalCursor.style.display = 'none';

    if (currentCharacterIndex === 0) {
        currentLogElement = document.createElement('div');
        terminalOutput.appendChild(currentLogElement);
    }

    currentLogElement.innerHTML = fullLogStringFormatted.substring(0, currentCharacterIndex + 1);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    currentCharacterIndex++;

    if (currentCharacterIndex >= fullLogStringFormatted.length) {
        currentCharacterIndex = 0;
        currentLogIndex++;
        clearInterval(typingInterval);

        logDelayTimeout = setTimeout(() => {
            if (currentLogIndex < logEntries.length) {
                 typingInterval = setInterval(typeLogEntry, typingSpeed);
            } else {
                 if(terminalCursor) terminalCursor.style.display = 'inline-block';
            }
        }, logDelay);
    }
} //

function startTerminalAnimation() {
    if (!terminalOutput) return;
    terminalOutput.innerHTML = '';
    currentLogIndex = 0;
    currentCharacterIndex = 0;
    if (currentLogElement) currentLogElement = null;

    clearTimeout(logDelayTimeout);
    clearInterval(typingInterval);

    typingInterval = setInterval(typeLogEntry, typingSpeed);
} //

const terminalSection = document.getElementById('terminal');
if (terminalSection && terminalOutput) {
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                startTerminalAnimation(); //
                terminalObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    terminalObserver.observe(terminalSection);
} //

if (clearTerminalBtn) {
    clearTerminalBtn.addEventListener('click', startTerminalAnimation); //
}
/* --- Terminal Section End --- */


/*=============== CONTACT FORM VALIDATION & SUBMISSION ===============*/
const nameInput = document.getElementById('contact-name'),
      emailInput = document.getElementById('contact-email'),
      messageInput = document.getElementById('contact-message'),
      nameError = document.getElementById('name-error'),
      emailError = document.getElementById('email-error'),
      messageError = document.getElementById('message-error'),
      successMessage = document.getElementById('success-message'); //

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
} //

function showError(inputElement, errorElement, message) {
    if (!inputElement || !errorElement) return;
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.parentElement.classList.add('error');
} //

function clearError(inputElement, errorElement) {
    if (!inputElement || !errorElement) return;
    errorElement.textContent = '';
    errorElement.classList.remove('show');
     inputElement.parentElement.classList.remove('error');
} //

function showSuccessMessage() {
    if (!successMessage) return;
    successMessage.textContent = "Message sent! Juah will reply after her nap... eventually. 😴";
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
} //

if (contactForm && nameInput && emailInput && messageInput && nameError && emailError && messageError && successMessage) { //
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let isValid = true;

        clearError(nameInput, nameError); //
        clearError(emailInput, emailError); //
        clearError(messageInput, messageError); //
        if (successMessage) successMessage.classList.remove('show');

        if (nameInput.value.trim() === '') {
            showError(nameInput, nameError, "Oops, did you fall asleep typing your name?"); //
            isValid = false;
        }
        if (emailInput.value.trim() === '') {
            showError(emailInput, emailError, "Need an email, unless you communicate telepathically?"); //
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) { //
            showError(emailInput, emailError, "Hmm, that email looks a bit... creative. Try again?"); //
            isValid = false;
        }
        if (messageInput.value.trim().length < 10) {
            showError(messageInput, messageError, "Say a bit more! Even 'I like naps' works (min 10 chars)."); //
            isValid = false;
        }

        if (isValid) {
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending... <i class="bi bi-hourglass-split button__icon"></i>';

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    showSuccessMessage(); //
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        let errorText = "Hmm, something went wrong. Maybe try again later?";
                        if (data && data.errors && data.errors.length > 0) {
                            errorText = data.errors.map(err => err.message).join(", ");
                        } else if (data && data.error) {
                            errorText = data.error;
                        }
                         showError(messageInput, messageError, `Server Error: ${errorText}`); //
                    }).catch(() => {
                        showError(messageInput, messageError, "Server Error: Couldn't process response. Try again later."); //
                    });
                }
            }).catch(error => {
                 showError(messageInput, messageError, `Network Error: Couldn't send. Check connection? ${error}`); //
            }).finally(() => {
                 submitButton.disabled = false;
                 submitButton.innerHTML = originalButtonText;
            });
        } else {
             const firstError = contactForm.querySelector('.error input, .error textarea');
             if(firstError) firstError.focus();
        }
    }); //

    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            const errorElementId = `${input.id}-error`;
            const errorElement = document.getElementById(errorElementId);
            if(errorElement && errorElement.classList.contains('show')) {
                 clearError(input, errorElement); //
            }
        });
    }); //
}
/* --- Contact Section End --- */


/*=============== RIPPLE EFFECT ON BUTTONS ===============*/
function createRipple(event) {
    const button = event.currentTarget;

    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) { existingRipple.remove(); }

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    const rippleX = event.clientX - rect.left - radius;
    const rippleY = event.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${rippleX}px`;
    circle.style.top = `${rippleY}px`;
    circle.classList.add("ripple");

    button.appendChild(circle);

    circle.addEventListener('animationend', () => {
        circle.remove();
    }, { once: true });
} //

if (allButtons.length > 0) {
    allButtons.forEach(button => {
        button.addEventListener("click", createRipple); //
    });
}
/* --- Ripple Effect End --- */

/*=============== HOME BUBBLE ANIMATION ===============*/
function createBubble() {
    if (!bubbleContainer) return;

    const bubble = document.createElement('span');
    bubble.classList.add('bubble');

    // Random size (within CSS defined ranges is better, but we can set base here)
    const size = Math.random() * 40 + 20; // Random size between 20px and 60px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Random horizontal position
    bubble.style.left = `${Math.random() * 100}%`;

    // Random animation duration and delay (CSS handles base, JS can add variation)
    const duration = Math.random() * 10 + 10; // 10s to 20s
    const delay = Math.random() * 5;        // 0s to 5s delay
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;


    bubbleContainer.appendChild(bubble);

    // Remove bubble after animation finishes to prevent DOM clutter
    bubble.addEventListener('animationend', () => {
        bubble.remove();
    }, { once: true });
}

// Create bubbles periodically
if (bubbleContainer) {
    // Create initial batch
    for (let i = 0; i < 15; i++) { // Adjust number of initial bubbles
        createBubble();
    }
    // Create new bubbles at intervals
    setInterval(createBubble, 1000); // Create a new bubble every 1 second
}
/* --- Bubble Animation End --- */


/*=============== DYNAMIC YEAR IN FOOTER ===============*/
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

/*=============== INITIALIZATION LOG ===============*/
console.log("Juah's Dreamland Script Loaded! Ready for bubbles, naps, and fun.");