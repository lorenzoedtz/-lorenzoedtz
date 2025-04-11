document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores DOM ---
    const navbar = document.getElementById('navbar');
    const modalOverlay = document.getElementById('settings-modal');
    const modalContent = modalOverlay?.querySelector('.modal-content'); // Adicionado optional chaining
    const settingsTrigger = document.getElementById('settings-trigger');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const themeValueLabel = document.getElementById('theme-value-label');
    const accentOptionsContainer = document.getElementById('accent-options');
    const particlesCheckbox = document.getElementById('particles-checkbox');
    const particlesValueLabel = document.getElementById('particles-value-label');
    const particlesContainer = document.getElementById('particles-js');
    const animationsCheckbox = document.getElementById('animations-checkbox');
    const animationsValueLabel = document.getElementById('animations-value-label');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    const yearSpan = document.getElementById('current-year');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const body = document.body;

    // --- Configurações e LocalStorage ---
    const SETTINGS_KEY = 'lorenzoedtz_settings_v2';
    const DEFAULT_SETTINGS = {
        theme: 'light', // <-- Default é light
        accentColor: 'hsl(203, 89%, 53%)',
        particlesEnabled: true,
        animationsEnabled: true
    };

    // --- Funções Auxiliares ---
    function hslToHex(h, s, l) {
        l /= 100; const a = s * Math.min(l, 1 - l) / 100;
        const f = n => { const k = (n + h / 30) % 12; const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * color).toString(16).padStart(2, '0'); };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    function getHexFromHslString(hslString) {
        if (!hslString || typeof hslString !== 'string') return '#808080';
        const hslMatch = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
        if (hslMatch) { try { const h = parseInt(hslMatch[1]), s = parseFloat(hslMatch[2]), l = parseFloat(hslMatch[3]); return hslToHex(h, s, l); } catch (e) { console.error("Erro ao converter HSL para HEX:", e); return '#808080'; } }
        console.warn("String HSL inválida para particles, usando fallback:", hslString); return '#808080';
    }

    // Funções getSettings, saveSettings, resetSettings
    const getSettings = () => {
        const saved = localStorage.getItem(SETTINGS_KEY); try { const parsed = saved ? JSON.parse(saved) : {}; return { ...DEFAULT_SETTINGS, ...parsed }; } catch (error) { console.error("Erro ao ler localStorage:", error); return { ...DEFAULT_SETTINGS }; } };
    const saveSettings = (settings) => {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (error) { console.error("Erro ao salvar localStorage:", error); } };
    const resetSettings = () => {
        if (confirm("Tem certeza que deseja resetar todas as configurações para o padrão?")) { localStorage.removeItem(SETTINGS_KEY); currentSettings = { ...DEFAULT_SETTINGS }; applyAllSettings(currentSettings); console.log("Configurações resetadas."); } };

    let currentSettings = getSettings();

    // --- Aplicação das Configurações ---
    const applyTheme = (theme) => {
        if(theme !== 'light' && theme !== 'dark') theme = DEFAULT_SETTINGS.theme;
        document.documentElement.setAttribute('data-theme', theme);
        if(themeCheckbox) themeCheckbox.checked = theme === 'light'; else console.error("themeCheckbox não encontrado ao aplicar tema");
        if (themeValueLabel) themeValueLabel.textContent = theme === 'light' ? 'Claro' : 'Escuro';
        currentSettings.theme = theme;
    };

    const applyAccentColor = (color) => {
        if (!color || typeof color !== 'string') { color = DEFAULT_SETTINGS.accentColor; }
        document.documentElement.style.setProperty('--primary-color', color);
        const hslMatch = color.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
        if (hslMatch) { document.documentElement.style.setProperty('--primary-hue', hslMatch[1]); document.documentElement.style.setProperty('--primary-saturation', `${hslMatch[2]}%`); document.documentElement.style.setProperty('--primary-lightness', `${hslMatch[3]}%`); const hoverLightness = Math.max(0, parseFloat(hslMatch[3]) - 5); document.documentElement.style.setProperty('--primary-color-hover', `hsl(${hslMatch[1]}, ${hslMatch[2]}%, ${hoverLightness}%)`); } else { document.documentElement.style.setProperty('--primary-color-hover', color); document.documentElement.style.removeProperty('--primary-hue'); document.documentElement.style.removeProperty('--primary-saturation'); document.documentElement.style.removeProperty('--primary-lightness'); }
        currentSettings.accentColor = color;
        if(accentOptionsContainer) accentOptionsContainer.querySelectorAll('.color-choice').forEach(btn => { btn.classList.toggle('selected', btn.dataset.color === color); });
        if (currentSettings.particlesEnabled && typeof particlesJS !== 'undefined') { applyParticlesState(true); }
    };

    // --- Controle de Partículas ---
    let particlesInstance = null;
    const particleConfigBase = {
         "particles": { "number": { "value": 40, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#808080" }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true, "anim": { "enable": false } }, "size": { "value": 3, "random": true, "anim": { "enable": false } }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out" } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "bubble" }, "onclick": { "enable": false }, "resize": true }, "modes": { "bubble": { "distance": 100, "size": 5, "duration": 2, "opacity": 0.8 } } }, "retina_detect": true };
    const getParticleConfig = (accentColorHsl) => {
         const config = JSON.parse(JSON.stringify(particleConfigBase)); const hexColor = getHexFromHslString(accentColorHsl); config.particles.color.value = hexColor; if(config.interactivity.modes.bubble) config.interactivity.modes.bubble.color = hexColor; console.log(`Particles config created with color: ${accentColorHsl} -> ${hexColor}`); return config; };
    const destroyParticles = () => {
         if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0].pJS?.fn?.vendors?.destroypJS) { try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); window.pJSDom = []; particlesInstance = null; console.log("Particles Destroyed"); } catch(e) { console.error("Error destroying particles:", e); window.pJSDom = []; particlesInstance = null;} } };
    const enableParticles = () => {
         if (typeof particlesJS !== 'undefined') { destroyParticles(); const colorToUseHsl = currentSettings.accentColor || DEFAULT_SETTINGS.accentColor; const currentConfig = getParticleConfig(colorToUseHsl); try { particlesJS('particles-js', currentConfig); setTimeout(() => { if (window.pJSDom && window.pJSDom.length > 0) { particlesInstance = window.pJSDom[0].pJS; } else { console.warn("Could not capture particlesJS instance."); } }, 100); if(particlesContainer) particlesContainer.classList.remove('hidden'); console.log("Particles Enabled/Updated."); } catch (error) { console.error("ERROR initializing particlesJS:", error); if(particlesContainer) particlesContainer.classList.add('hidden'); } } else { console.error("particlesJS library not loaded."); if(particlesContainer) particlesContainer.classList.add('hidden'); } };
    const disableParticles = () => {
        destroyParticles(); if(particlesContainer) particlesContainer.classList.add('hidden'); console.log("Particles Disabled"); };
    const applyParticlesState = (enabled) => {
        if(enabled && !currentSettings.accentColor) { currentSettings.accentColor = DEFAULT_SETTINGS.accentColor; } if (enabled) { enableParticles(); } else { disableParticles(); }
        if(particlesCheckbox) particlesCheckbox.checked = enabled;
        if (particlesValueLabel) particlesValueLabel.textContent = enabled ? 'Ativado' : 'Desativado';
    };

    // --- Controle de Animações de Scroll ---
    let intersectionObserver = null;
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => { if (entry.isIntersecting && currentSettings.animationsEnabled) { entry.target.classList.add('visible'); } else if (!entry.isIntersecting && currentSettings.animationsEnabled) { entry.target.classList.remove('visible'); } }); };
    const initializeObserver = () => {
         if (intersectionObserver) { intersectionObserver.disconnect(); } const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }; try { intersectionObserver = new IntersectionObserver(observerCallback, observerOptions); if(animatedElements) animatedElements.forEach(el => intersectionObserver.observe(el)); console.log("Observer Initialized"); } catch (error) { console.error("Failed to init Observer:", error); if(animatedElements) animatedElements.forEach(el => el.classList.add('visible')); if(body) body.classList.add('no-scroll-animations'); } };
    const disableObserver = () => {
        if (intersectionObserver) { intersectionObserver.disconnect(); intersectionObserver = null; console.log("Observer Disabled"); } if(animatedElements) animatedElements.forEach(el => { el.classList.remove('visible'); el.style.opacity = 1; el.style.transform = 'none'; }); };
    const applyAnimationsState = (enabled) => {
        if(animationsCheckbox) animationsCheckbox.checked = enabled;
        if (animationsValueLabel) animationsValueLabel.textContent = enabled ? 'Ativadas' : 'Desativadas';
        currentSettings.animationsEnabled = enabled;
        if(body) body.classList.toggle('no-scroll-animations', !enabled);
        if (enabled) { if(animatedElements) animatedElements.forEach(el => { el.style.opacity = ''; el.style.transform = ''; }); initializeObserver(); } else { disableObserver(); }
    };

    // --- Função Principal de Aplicação ---
    const applyAllSettings = (settings) => {
        applyTheme(settings.theme);
        applyAccentColor(settings.accentColor);
        applyAnimationsState(settings.animationsEnabled);
        applyParticlesState(settings.particlesEnabled); // Por último
    };

    // --- Aplicação Inicial ---
    try {
        currentSettings = { ...DEFAULT_SETTINGS, ...getSettings() }; // Garante defaults
        applyAllSettings(currentSettings);
    } catch (error) { console.error("CRITICAL ERROR ON INITIALIZATION:", error); alert("Erro ao carregar configurações."); }

    // --- Event Listeners (com verificações) ---
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => { const currentScrollY = window.scrollY; if (navbar) navbar.classList.toggle('scrolled', currentScrollY > 50); lastScrollY = currentScrollY; }, { passive: true });
    const openModal = () => { if (!modalOverlay) {console.error("Modal overlay not found!"); return;} modalOverlay.classList.add('show-modal'); const focusable = modalContent?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (focusable) focusable.focus(); else { modalContent?.setAttribute('tabindex', '-1'); modalContent?.focus(); } if(body) body.style.overflow = 'hidden'; };
    const closeModal = () => { if (!modalOverlay) return; modalOverlay.classList.remove('show-modal'); if(body) body.style.overflow = ''; };
    if (settingsTrigger) settingsTrigger.addEventListener('click', openModal); else console.error("settingsTrigger not found!");
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal); else console.error("modalCloseBtn not found!");
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay?.classList.contains('show-modal')) { closeModal(); } });
    if (themeCheckbox) { themeCheckbox.addEventListener('change', (e) => { const newTheme = e.target.checked ? 'light' : 'dark'; applyTheme(newTheme); saveSettings(currentSettings); }); } else { console.error("themeCheckbox not found!");}
    if (accentOptionsContainer) { accentOptionsContainer.addEventListener('click', (e) => { if (e.target.classList.contains('color-choice')) { const newColor = e.target.dataset.color; if (newColor && newColor !== currentSettings.accentColor) { applyAccentColor(newColor); saveSettings(currentSettings); } } }); } else { console.error("accentOptionsContainer not found!");}
    if (particlesCheckbox) { particlesCheckbox.addEventListener('change', (e) => { const isEnabled = e.target.checked; applyParticlesState(isEnabled); currentSettings.particlesEnabled = isEnabled; saveSettings(currentSettings); }); } else { console.error("particlesCheckbox not found!");}
    if (animationsCheckbox) { animationsCheckbox.addEventListener('change', (e) => { const isEnabled = e.target.checked; applyAnimationsState(isEnabled); saveSettings(currentSettings); }); } else { console.error("animationsCheckbox not found!");}
    if (resetSettingsBtn) { resetSettingsBtn.addEventListener('click', resetSettings); } else { console.error("resetSettingsBtn not found!");}
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    console.log("Script Loaded Successfully. Initial Settings:", currentSettings);

}); // Fim do DOMContentLoaded