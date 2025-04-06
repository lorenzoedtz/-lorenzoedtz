document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Adiciona a classe 'scrolled' após rolar 50px
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Theme Switcher ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    // Aplica o tema salvo ao carregar a página
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme); // Usamos documentElement (<html>) para aplicar o tema
        if (currentTheme === 'light') {
            themeCheckbox.checked = true; // Marca o checkbox se for tema claro
        }
    } else {
        // Define escuro como padrão se não houver nada salvo
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Função para alternar o tema
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light'); // Salva a preferência
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark'); // Salva a preferência
        }
    }

    // Adiciona o listener ao checkbox
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', switchTheme, false);
    }

    // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Particles.js Initialization (Configuração de Fogo Original) ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#ff4500", "#ffa500", "#ff8c00"] }, // Cores de fogo
                "shape": { "type": "circle" },
                "opacity": {
                    "value": 0.6, // Um pouco mais sutil
                    "random": true,
                    "anim": { "enable": true, "speed": 0.5, "opacity_min": 0.1, "sync": false }
                 },
                "size": {
                    "value": 4,
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 0.5, "sync": false }
                },
                "line_linked": { "enable": false }, // Linhas desabilitadas para efeito de fogo/brasas
                "move": {
                    "enable": true,
                    "speed": 3, // Velocidade um pouco menor
                    "direction": "top", // Movimento para cima (como brasas subindo)
                    "random": true,
                    "straight": false,
                    "out_mode": "out", // Partículas saem da tela
                    "bounce": false,
                    "attract": { "enable": false }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "repulse" }, // Repele ao passar o mouse
                    "onclick": { "enable": true, "mode": "push" }, // Adiciona partículas ao clicar
                    "resize": true
                },
                "modes": {
                    "repulse": { "distance": 80, "duration": 0.4 },
                    "push": { "particles_nb": 4 }
                    // Bubble e grab desativados para este efeito
                }
            },
            "retina_detect": true
        });
    } else {
        console.error("Particles.js library not loaded.");
    }

}); // Fim do DOMContentLoaded
