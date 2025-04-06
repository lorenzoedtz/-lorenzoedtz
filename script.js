document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores DOM ---
    const navbar = document.getElementById('navbar');
    const modalOverlay = document.getElementById('settings-modal');
    const modalContent = modalOverlay.querySelector('.modal-content');
    const settingsTrigger = document.getElementById('settings-trigger');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const accentOptionsContainer = document.getElementById('accent-options');
    const particlesCheckbox = document.getElementById('particles-checkbox');
    const particlesContainer = document.getElementById('particles-js');
    const yearSpan = document.getElementById('current-year');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // --- Configurações e LocalStorage ---
    const SETTINGS_KEY = 'lorenzoedtz_settings';

    // Função para obter configurações salvas ou padrão
    const getSettings = () => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        const defaults = {
            theme: 'dark',
            accentColor: 'hsl(203, 89%, 53%)', // Azul padrão
            particlesEnabled: true
        };
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    };

    // Função para salvar configurações
    const saveSettings = (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    };

    let currentSettings = getSettings();

    // --- Aplicação Inicial das Configurações ---

    // Aplicar Tema
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        currentSettings.theme = theme;
        themeCheckbox.checked = theme === 'light';
    };

    // Aplicar Cor de Destaque
    const applyAccentColor = (color) => {
        document.documentElement.style.setProperty('--primary-color', color);
        // Extrair HSL para sombra do botão (opcional, mas legal)
        const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
            document.documentElement.style.setProperty('--primary-hue', hslMatch[1]);
        }

        currentSettings.accentColor = color;
        // Marcar botão selecionado
        accentOptionsContainer.querySelectorAll('.color-choice').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === color);
        });
    };

    // Controlar Partículas
    let particlesInstance = null; // Guardar referência da instância
    const particleConfig = { /* Sua configuração de partículas aqui */
        "particles": {
            "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": ["#ff4500", "#ffa500", "#ff8c00", "#ff6347"] }, // Cores fogo + vermelho tomate
            "shape": { "type": "circle" },
            "opacity": { "value": 0.7, "random": true, "anim": { "enable": true, "speed": 0.8, "opacity_min": 0.1, "sync": false } },
            "size": { "value": 4, "random": true, "anim": { "enable": true, "speed": 3, "size_min": 0.5, "sync": false } },
            "line_linked": { "enable": false },
            "move": { "enable": true, "speed": 4, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
            "modes": { "repulse": { "distance": 90, "duration": 0.4 }, "push": { "particles_nb": 4 } }
        }, "retina_detect": true
    };

    const enableParticles = () => {
        if (typeof particlesJS !== 'undefined' && !particlesInstance) {
            particlesJS('particles-js', particleConfig);
            // Tenta obter a instância criada
             if (window.pJSDom && window.pJSDom.length > 0) {
                particlesInstance = window.pJSDom[0].pJS;
            }
            particlesContainer.classList.remove('hidden');
            console.log("Particles Enabled");
        } else if (particlesInstance) {
             particlesContainer.classList.remove('hidden'); // Apenas mostra se já existe
             console.log("Particles Already Enabled, Showing");
        }
    };

    const disableParticles = () => {
        if (particlesInstance && particlesInstance.fn && particlesInstance.fn.vendors && particlesInstance.fn.vendors.destroypJS) {
             particlesInstance.fn.vendors.destroypJS(); // Destroi a instância
             particlesInstance = null; // Limpa a referência
             console.log("Particles Destroyed");
        } else if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0].pJS) {
            // Fallback se a instância não foi capturada corretamente antes
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            particlesInstance = null;
            console.log("Particles Destroyed (Fallback)");
        }
        particlesContainer.classList.add('hidden'); // Esconde o container
    };

    const applyParticlesState = (enabled) => {
        if (enabled) {
            enableParticles();
        } else {
            disableParticles();
        }
        currentSettings.particlesEnabled = enabled;
        particlesCheckbox.checked = enabled;
    };


    // Aplicação inicial ao carregar
    applyTheme(currentSettings.theme);
    applyAccentColor(currentSettings.accentColor);
    applyParticlesState(currentSettings.particlesEnabled);


    // --- Event Listeners ---

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Modal Control
    const openModal = () => modalOverlay.classList.add('show-modal');
    const closeModal = () => modalOverlay.classList.remove('show-modal');

    settingsTrigger.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        // Fecha se clicar fora do conteúdo do modal
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        // Fecha com a tecla Esc
        if (e.key === 'Escape' && modalOverlay.classList.contains('show-modal')) {
            closeModal();
        }
    });


    // Theme Toggle
    themeCheckbox.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'light' : 'dark';
        applyTheme(newTheme);
        saveSettings(currentSettings);
    });

    // Accent Color Selection (Event Delegation)
    accentOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-choice')) {
            const newColor = e.target.dataset.color;
            applyAccentColor(newColor);
            saveSettings(currentSettings);
        }
    });

     // Particles Toggle
    particlesCheckbox.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        applyParticlesState(enabled);
        saveSettings(currentSettings);
    });


    // Footer Year
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null, // Observa em relação ao viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger quando 10% do elemento está visível
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: parar de observar depois que animação ocorreu uma vez
                // observer.unobserve(entry.target);
            } else {
                 // Opcional: remover a classe para re-animar ao rolar para cima
                 // entry.target.classList.remove('visible');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => observer.observe(el));

}); // Fim do DOMContentLoaded
