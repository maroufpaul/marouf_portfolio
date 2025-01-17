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

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('show');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('show');
  });
});
function resizeCanvas() {
  const canvas = document.getElementById('hero-canvas');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
// Optional: Add more interactive elements, 
// such as intersection observers for fade-in, 
// or modals for project details, if desired.
