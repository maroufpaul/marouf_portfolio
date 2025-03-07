// script.js

window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const heroHeight = hero.offsetHeight; 
  const scrollPos = window.scrollY;

  if (scrollPos > heroHeight) {
    document.getElementById('hero-3d-bg').style.opacity = 0;
  } else {
    document.getElementById('hero-3d-bg').style.opacity = 1;
  }
});

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


document.querySelectorAll('.modal-link').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const url = link.getAttribute('data-url');
    const modal = document.getElementById('modal');
    const iframe = document.getElementById('modal-iframe');

    iframe.src = url;
    modal.style.display = 'flex';
  });
});

document.querySelector('.close-modal').addEventListener('click', () => {
  const modal = document.getElementById('modal');
  const iframe = document.getElementById('modal-iframe');

  iframe.src = ''; // Clear the iframe
  modal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', event => {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    const iframe = document.getElementById('modal-iframe');
    iframe.src = ''; // Clear the iframe
    modal.style.display = 'none';
  }
});


// Optional: Add more interactive elements, 
// such as intersection observers for fade-in, 
// or modals for project details, if desired.
