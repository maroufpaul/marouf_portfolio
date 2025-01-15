// script.js

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
  navbar.classList.toggle('nav-open');
  navbar.classList.toggle('nav-closed');
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetID = link.getAttribute('href');
    const targetElement = document.querySelector(targetID);

    // Close the nav menu in mobile view
    navbar.classList.remove('nav-open');
    navbar.classList.add('nav-closed');

    // Scroll to section
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Optional: Add more interactive elements, 
// such as intersection observers for fade-in, 
// or modals for project details, if desired.
