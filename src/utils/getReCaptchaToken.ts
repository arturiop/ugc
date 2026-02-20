export const getReCaptchaToken = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        if (!import.meta.env.VITE_APP_RE_CAPTCHA_KEY || !window.grecaptcha) {
            return resolve(null);
        }

        window.grecaptcha.ready(() => {
            window.grecaptcha
                .execute(import.meta.env.VITE_APP_RE_CAPTCHA_KEY, { action: 're_captcha_check' })
                .then(resolve)
                .catch(() => resolve(null));
        });
    });
};
