/**
 * Contact request form (book.html) — submits to Netlify Forms via fetch, no
 * page reload. Netlify detects the static form at deploy time (data-netlify
 * attribute + hidden form-name input in the markup); this script intercepts
 * the browser's own POST so the visitor never leaves the page. The <form>'s
 * action="/thank-you.html" is the no-JS fallback only.
 */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var errorBox = document.getElementById('contact-form-error');
  var intro = document.getElementById('contact-form-intro');
  var successBox = document.getElementById('contact-form-success');

  function encode(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      })
      .join('&');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorBox) errorBox.style.display = 'none';

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function (value, key) { payload[key] = value; });

    // Company website is plain text so visitors can type "evostr.com" without
    // a scheme (type="url" inputs reject that natively) — normalize to a full
    // URL here so what lands in Netlify/HubSpot is still clickable.
    if (payload.website && !/^https?:\/\//i.test(payload.website)) {
      payload.website = 'https://' + payload.website;
    }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Bad response: ' + response.status);

        document.dispatchEvent(new CustomEvent('evostr:contact_request_submitted', {
          detail: {
            company_size: payload.company_size,
            driver: payload.driver
          }
        }));

        form.style.display = 'none';
        if (intro) intro.style.display = 'none';
        if (successBox) successBox.style.display = 'block';
      })
      .catch(function () {
        if (errorBox) {
          errorBox.textContent = "Something went wrong on our end. Email us directly at info@evostr.com and we'll take it from there.";
          errorBox.style.display = 'block';
        }
      });
  });
})();
