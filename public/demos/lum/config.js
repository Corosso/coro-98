// Configuración de EmailJS para LÜM (DEMO — claves vacías).
// En el portafolio este formulario NO envía correos reales; está en modo demo.
const EMAILJS_CONFIG = {
    serviceId: '',
    templateId: '',
    userId: '',
    toEmail: ''
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMAILJS_CONFIG;
} else {
    window.EMAILJS_CONFIG = EMAILJS_CONFIG;
}
