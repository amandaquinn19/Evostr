/**
 * Mailchimp JSONP newsletter subscription handler
 * Wires up any number of signup forms to Mailchimp without a page redirect.
 *
 * Usage: add a config entry for each form on the page.
 */

(function () {
  var BASE_URL =
    'https://quinngrowthadvisors.us2.list-manage.com/subscribe/post-json' +
    '?u=5692e46898c5e3c0bd1785643' +
    '&id=d8f0e78715';

  /**
   * Wire up a single signup form.
   * @param {string} formId       - id of the <form> element
   * @param {string} emailInputId - id of the email <input>
   * @param {string} messageId    - id of the feedback <p>
   * @param {string} fId          - Mailchimp f_id for this specific form
   */
  function initForm(formId, emailInputId, messageId, fId) {
    var form = document.getElementById(formId);
    if (!form) return;

    var msg = document.getElementById(messageId);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById(emailInputId).value.trim();
      if (!email) return;

      var callbackName = 'mcCb_' + Date.now();
      var url =
        BASE_URL +
        '&f_id=' + fId +
        '&EMAIL=' + encodeURIComponent(email) +
        '&c=' + callbackName;

      var script = document.createElement('script');

      window[callbackName] = function (data) {
        if (msg) {
          msg.style.display = 'block';
          if (data.result === 'success') {
            msg.textContent = "You're subscribed.";
            msg.style.color = 'var(--oak)';
            form.reset();
          } else {
            // Strip HTML tags and the "0 - " prefix Mailchimp sometimes includes
            msg.textContent = data.msg
              .replace(/<[^>]+>/g, '')
              .replace(/^0 - /, '');
            msg.style.color = '#C0432F';
          }
        }
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      script.src = url;
      document.head.appendChild(script);

      // Fallback: show a generic error if Mailchimp doesn't respond within 5s
      setTimeout(function () {
        if (window[callbackName]) {
          if (msg) {
            msg.textContent = 'Something went wrong. Please try again.';
            msg.style.display = 'block';
            msg.style.color = '#C0432F';
          }
          delete window[callbackName];
          if (script.parentNode) script.parentNode.removeChild(script);
        }
      }, 5000);
    });
  }

  // Footer newsletter form (all pages)
  initForm('mc-form', 'footer-email', 'mc-message', '0073abe0f0');

  // Resources page inline signup form
  initForm('mc-form-resources', 'signup-email', 'mc-message-resources', '0072abe0f0');

})();
