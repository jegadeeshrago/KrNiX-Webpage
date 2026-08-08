// Configuration Constants
const FRAME_COUNT = 240;
const FOLDER_NAME = 'ezgif-226482ade8d02b76-jpg';
const FILE_PREFIX = 'ezgif-frame-';
const FILE_EXTENSION = 'jpg';

// DOM Elements
const canvas = document.getElementById('animation-canvas');
const context = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');
const header = document.getElementById('header');

// Subtitle Rotate Configuration
const rotateTexts = [
  "Connecting Vision to Intelligence",
  "Connecting Sensors to Intelligence"
];
let rotateIndex = 0;
const rotateElement = document.getElementById('hero-rotate');

// Pipeline Elements
const pipelineSteps = document.querySelectorAll('.pipeline-step');
const pipelineContainer = document.querySelector('.pipeline-container');
const pipelineLineActive = document.getElementById('pipeline-line-active');

// Mobile Menu Elements
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Expertise Elements
const chipBlocks = document.querySelectorAll('.chip-block');

// Contact Form Elements
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formFeedback = document.getElementById('form-feedback');

// Application State
const images = [];
let loadedCount = 0;
let currentFrameIndex = 0;
let animationFrameId = null;

// Generate filenames: e.g. "ezgif-226482ade8d02b76-jpg/ezgif-frame-001.jpg"
function getFramePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `./${FOLDER_NAME}/${FILE_PREFIX}${paddedIndex}.${FILE_EXTENSION}`;
}

// Preload Images
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
        
        // Update loader UI
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.innerText = `${percent}%`;

        if (loadedCount === FRAME_COUNT) {
          setTimeout(() => {
            hideLoader();
            resolve();
          }, 400); // Small visual buffer for smooth finish
        }
      };
      
      // Fallback for image load error to avoid freezing the loader
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          hideLoader();
          resolve();
        }
      };

      images.push(img);
    }
  });
}

function hideLoader() {
  if (loader) {
    loader.classList.add('fade-out');
  }
}

// Draw frame inside Canvas matching "background-size: cover"
function drawFrame(image) {
  if (!image || !image.complete) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;

  // Calculate cover dimensions
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasRatio > imageRatio) {
    // Canvas is wider than image
    drawHeight = canvasWidth / imageRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    // Canvas is taller than image
    drawWidth = canvasHeight * imageRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

// Canvas Resizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Redraw current frame immediately
  if (images[currentFrameIndex]) {
    drawFrame(images[currentFrameIndex]);
  }
}

// Handle scroll logic
function handleScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const maxScroll = docHeight - winHeight;

  if (maxScroll <= 0) return;

  // Track progress bar percentage
  const scrollFraction = scrollTop / maxScroll;
  if (scrollProgressIndicator) {
    scrollProgressIndicator.style.width = `${scrollFraction * 100}%`;
  }

  // Map scroll progress to image sequence
  const targetFrameIndex = Math.min(
    FRAME_COUNT - 1,
    Math.floor(scrollFraction * FRAME_COUNT)
  );

  if (targetFrameIndex !== currentFrameIndex) {
    currentFrameIndex = targetFrameIndex;
    
    // Throttle rendering via requestAnimationFrame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(() => {
      drawFrame(images[currentFrameIndex]);
    });
  }

  // Header background control
  if (header) {
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Handle pipeline progress animation
  handlePipelineScroll();
}

// Handle pipeline progress
function handlePipelineScroll() {
  if (!pipelineContainer) return;
  
  const rect = pipelineContainer.getBoundingClientRect();
  const containerHeight = rect.height;
  const viewportHeight = window.innerHeight;
  
  // Calculate progress relative to viewport center
  const triggerPoint = viewportHeight / 2;
  const relativeScroll = triggerPoint - rect.top;
  let progressFraction = 0;
  
  if (relativeScroll > 0) {
    // The pipeline connector line is 100% height. Offset it slightly for the last step.
    progressFraction = Math.min(1, relativeScroll / (containerHeight - 150));
  }
  
  // Set golden/purple active line height
  if (pipelineLineActive) {
    pipelineLineActive.style.height = `${progressFraction * 100}%`;
  }
  
  // Process pipeline stages depending on scroll line intersection
  pipelineSteps.forEach((step, idx) => {
    const stepRect = step.getBoundingClientRect();
    const stepCenter = stepRect.top + stepRect.height / 2;
    
    if (stepCenter < triggerPoint) {
      step.classList.add('active');
      if (idx > 0) {
        pipelineSteps[idx - 1].classList.add('processed');
      }
    } else {
      step.classList.remove('active');
      step.classList.remove('processed');
    }
  });
}

// Hero Subtitle Rotation
function rotateHeroSubtitle() {
  if (!rotateElement) return;
  
  // Transition out
  rotateElement.style.opacity = 0;
  rotateElement.style.transform = 'translateY(-15px)';
  
  setTimeout(() => {
    rotateIndex = (rotateIndex + 1) % rotateTexts.length;
    rotateElement.textContent = rotateTexts[rotateIndex];
    rotateElement.style.transform = 'translateY(15px)';
    
    // Force reflow
    rotateElement.offsetHeight; 
    
    // Transition in
    rotateElement.style.opacity = 1;
    rotateElement.style.transform = 'translateY(0)';
  }, 500);
}

// Mobile Menu Handler
function initMobileMenu() {
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuToggle.classList.toggle('active');
    
    const spans = menuToggle.querySelectorAll('span');
    if (menuToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
  
  // Close menu when a navigation link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.querySelectorAll('span').forEach(s => s.style.transform = 'none');
      menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
    });
  });
}

// Expertise Mapping Interaction
function initExpertiseMapping() {
  chipBlocks.forEach(block => {
    block.addEventListener('click', () => {
      chipBlocks.forEach(b => b.classList.remove('active'));
      block.classList.add('active');
    });
  });
}

// Contact Form Handler
function initContactForm() {
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    
    let isValid = true;
    
    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.classList.add('invalid');
      isValid = false;
    } else {
      nameInput.classList.remove('invalid');
    }
    
    // Validate Phone (Accept standard formats and length)
    const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
    if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim())) {
      phoneInput.classList.add('invalid');
      isValid = false;
    } else {
      phoneInput.classList.remove('invalid');
    }
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('invalid');
    }
    
    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.classList.add('invalid');
      isValid = false;
    } else {
      messageInput.classList.remove('invalid');
    }
    
    if (!isValid) {
      formFeedback.className = 'form-feedback error';
      formFeedback.textContent = 'Please correct the highlighted errors before submitting.';
      formFeedback.style.display = 'block';
      return;
    }
    
    // Disable submission while transmitting
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formFeedback.style.display = 'none';
    
    const formData = new FormData();
    formData.append('name', nameInput.value.trim());
    formData.append('phone', phoneInput.value.trim());
    formData.append('email', emailInput.value.trim());
    formData.append('message', messageInput.value.trim());
    
    // Fallback key check
    const configKeyInput = document.getElementById('web3forms-key');
    const accessKey = configKeyInput ? configKeyInput.value : 'YOUR_ACCESS_KEY_HERE';
    formData.append('access_key', accessKey);
    
    try {
      // Local sandbox check if no token is configured yet
      if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
        await new Promise(resolve => setTimeout(resolve, 1200));
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = 'Thanks. Your message has been received. Our team will get back to you shortly. (Local Sandbox Mode)';
        contactForm.reset();
      } else {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        if (data.success) {
          formFeedback.className = 'form-feedback success';
          formFeedback.textContent = 'Thanks. Your message has been received. Our team will get back to you shortly.';
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      }
    } catch (error) {
      formFeedback.className = 'form-feedback error';
      formFeedback.textContent = 'Unable to send message at this time. Please send specifications to our technical email.';
      formFeedback.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
      formFeedback.style.display = 'block';
    }
  });
  
  // Real-time input error removals on typing
  const inputs = [
    document.getElementById('form-name'),
    document.getElementById('form-phone'),
    document.getElementById('form-email'),
    document.getElementById('form-message')
  ];
  
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.classList.remove('invalid');
        }
      });
    }
  });
}

// Intersection Observer for scroll-triggered viewport animations
function initIntersectionObserver() {
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };
  
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  const animTargets = document.querySelectorAll(
    '.service-card, .why-card, .chip-block, .section-header, .contact-info, .contact-form, .client-logo-box'
  );
  
  animTargets.forEach(el => {
    el.classList.add('scroll-reveal');
    fadeObserver.observe(el);
  });
}

// Initialization
async function init() {
  // Bind resize handler
  window.addEventListener('resize', resizeCanvas);
  
  // Set initial canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Start preloading images
  await preloadImages();

  // Draw first frame when ready
  if (images[0]) {
    images[0].onload = () => drawFrame(images[0]);
    drawFrame(images[0]);
  }

  // Bind scroll handler
  window.addEventListener('scroll', handleScroll);
  
  // Initialize modular features
  initMobileMenu();
  initExpertiseMapping();
  initContactForm();
  initIntersectionObserver();
  
  // Start subtitle rotation cycle
  setInterval(rotateHeroSubtitle, 4000);
  
  // Trigger initial scroll calculations to position current elements correctly
  handleScroll();
}

document.addEventListener('DOMContentLoaded', init);
