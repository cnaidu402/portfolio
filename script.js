// GitHub API Configuration
const GITHUB_USERNAME = 'cnaidu402';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

// DOM Elements
const projectsContainer = document.getElementById('projects-container');
const loadingElement = document.getElementById('loading');
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Handle Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle (Simple implementation)
hamburger.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(15, 17, 21, 0.95)';
        navLinks.style.padding = '2rem';
        navLinks.style.backdropFilter = 'blur(10px)';
    }
});

// Fetch GitHub Projects
async function fetchProjects() {
    try {
        const [response, featuredResponse] = await Promise.all([
            fetch(API_URL),
            fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/voice_ai_concierge`)
        ]);
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        let repos = await response.json();
        let featuredRepo = null;
        
        if (featuredResponse.ok) {
            featuredRepo = await featuredResponse.json();
        }
        
        // Filter out portfolio, UMBC Data 606, and the featured repo (to avoid duplicates)
        repos = repos.filter(repo => {
            const name = repo.name.toLowerCase();
            const isPortfolio = name === 'portfolio';
            const isUMBC606 = name.includes('umbc') && name.includes('606');
            const isFeatured = featuredRepo && repo.id === featuredRepo.id;
            return !isPortfolio && !isUMBC606 && !isFeatured;
        });
        
        // Add featured repo to the top
        if (featuredRepo) {
            // Keep total at 6 by slicing if necessary
            repos = repos.slice(0, 5);
            repos.unshift(featuredRepo);
        }
        
        // Remove loading state
        loadingElement.style.display = 'none';
        
        // Generate and append cards
        if (repos.length === 0) {
            projectsContainer.innerHTML = '<p class="text-center w-100 p-4">No public repositories found yet.</p>';
            return;
        }

        repos.forEach((repo, index) => {
            // Determine language icon and color based on AI/DS focus typical languages
            let langIcon = 'fas fa-code';
            if (repo.language) {
                const lang = repo.language.toLowerCase();
                if (lang === 'python' || lang === 'jupyter notebook') langIcon = 'fab fa-python';
                else if (lang === 'javascript' || lang === 'typescript') langIcon = 'fab fa-js';
                else if (lang === 'java') langIcon = 'fab fa-java';
                else if (lang === 'html') langIcon = 'fab fa-html5';
                else if (lang === 'css') langIcon = 'fab fa-css3-alt';
            }

            const card = document.createElement('div');
            card.className = 'glass-panel project-card fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Format date
            const updateDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            });

            card.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <h3 style="text-transform: capitalize;">${repo.name.replace(/[-_]/g, ' ')}</h3>
                    <p>${repo.description || 'No description provided. Explore the code on GitHub to learn more about this project.'}</p>
                    
                    <div class="project-meta">
                        <span class="project-lang">
                            <i class="${langIcon}"></i> ${repo.language || 'Multi-language'}
                        </span>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="far fa-star"></i> ${repo.stargazers_count}</span>
                            <a href="${repo.html_url}" target="_blank" class="project-link" rel="noopener noreferrer" aria-label="View on GitHub">
                                <i class="fab fa-github fa-lg"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            projectsContainer.appendChild(card);
        });

        // Trigger reveal animations for newly added elements
        triggerAnimations();

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        loadingElement.innerHTML = '<p style="color: #fc8181;">Failed to load projects. Please visit GitHub directly.</p>';
    }
}

// Scroll Reveal Animation (Intersection Observer)
function triggerAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in, .timeline-item, .skills-glass-card, .about-text');
    fadeElements.forEach(el => {
        // Add base class if not present
        if (!el.classList.contains('fade-in') && !el.classList.contains('timeline-item')) {
            el.classList.add('fade-in');
        }
        observer.observe(el);
    });
}

// Typing Effect for Hero Section
const rolesToType = ["AI Engineer", "GenAI Engineer", "LLM Engineer", "ML Engineer", "Data Scientist"];
let roleTypingIndex = 0;
let charTypingIndex = 0;
let isDeletingRole = false;

function typeHeroRole() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const currentRole = rolesToType[roleTypingIndex];
    
    if (isDeletingRole) {
        textElement.textContent = currentRole.substring(0, charTypingIndex - 1);
        charTypingIndex--;
    } else {
        textElement.textContent = currentRole.substring(0, charTypingIndex + 1);
        charTypingIndex++;
    }

    let typeSpeed = isDeletingRole ? 50 : 100;

    if (!isDeletingRole && charTypingIndex === currentRole.length) {
        typeSpeed = 2000; // Pause at end of word
        isDeletingRole = true;
    } else if (isDeletingRole && charTypingIndex === 0) {
        isDeletingRole = false;
        roleTypingIndex = (roleTypingIndex + 1) % rolesToType.length;
        typeSpeed = 500; // Pause before typing new word
    }

    setTimeout(typeHeroRole, typeSpeed);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    triggerAnimations();
    typeHeroRole();
});
