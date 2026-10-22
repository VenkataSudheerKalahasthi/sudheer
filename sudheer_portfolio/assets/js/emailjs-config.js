/**
 * EmailJS Client-Side Configuration
 *
 * Exact Environment Variable Names:
 * - EMAILJS_SERVICE_ID
 * - EMAILJS_TEMPLATE_ID
 * - EMAILJS_PUBLIC_KEY
 *
 * Instructions:
 * 1. Log in to https://dashboard.emailjs.com/
 * 2. Connect an Email Service (e.g. Gmail) -> get your Service ID.
 * 3. Create an Email Template -> get your Template ID.
 * 4. Navigate to Account > API Keys -> copy your Public Key.
 *
 * SECURITY NOTICE:
 * - Only your EmailJS Public Key belongs here.
 * - NEVER commit or expose your Private Key / Secret Key in client-side code.
 */

window.EMAILJS_CONFIG = {
  // Reads injected environment variables if supported by your deployment/bundler,
  // or falls back to the values below.
  SERVICE_ID: (typeof process !== "undefined" && process.env?.EMAILJS_SERVICE_ID) || "service_sudheer",
  TEMPLATE_ID: (typeof process !== "undefined" && process.env?.EMAILJS_TEMPLATE_ID) || "template_sudheer",
  PUBLIC_KEY: (typeof process !== "undefined" && process.env?.EMAILJS_PUBLIC_KEY) || "Y6o7zKcujG50UvUlk"
};
