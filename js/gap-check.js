/**
 * Commercial Gap Check — client-side scoring.
 * 10 questions, 3-point scale (Reactive=0, Developing=1, Structured=2), grouped into 4 dimensions.
 */
(function () {
  var TOTAL_QUESTIONS = 10;

  var DIMENSIONS = [
    { id: 1, name: 'Go-to-Market Narrative', questions: [1, 2, 3] },
    { id: 2, name: 'Sales Process &amp; Team Fluency', questions: [4, 5, 6] },
    { id: 3, name: 'Business Strategy (Comp &amp; Pricing)', questions: [7, 8] },
    { id: 4, name: 'Account Management', questions: [9, 10] }
  ];

  var LEVEL_LABELS = ['Reactive', 'Developing', 'Structured'];

  var BANDS = [
    {
      min: 0,
      max: 7,
      name: 'The capability is well ahead of the commercial motion.',
      copy: "Several dimensions are still reactive. This isn't a one-fix situation — the gap is probably compounding across more than one of the four areas, and picking one to fix first without knowing how they interact is a common way to spend a year and not see the deal flow change."
    },
    {
      min: 8,
      max: 14,
      name: 'Part of the motion is working. A real gap is still costing you deals.',
      copy: 'At least one dimension looks structured, but at least one is still reactive or barely developing — and it only takes one weak link (a comp plan working against the strategy, an AM team with no framework, a narrative that still leads with the platform) to cap what the rest of the motion can produce.'
    },
    {
      min: 15,
      max: 20,
      name: 'The fundamentals are largely in place. The remaining gap is narrower — and worth pinning down precisely.',
      copy: "Most of what you can control internally looks structured. What's left is often the harder-to-self-diagnose piece: proof at scale, a sharper differentiated narrative, or a segment of buyers who aren't ready yet for reasons that have nothing to do with your pitch. That's a smaller, more specific problem — and it's usually the kind self-report can't fully resolve on its own."
    }
  ];

  var form = document.getElementById('gcForm');
  var progressCount = document.getElementById('gcAnsweredCount');
  var progressFill = document.getElementById('gcProgressFill');
  var submitBtn = document.getElementById('gcSubmitBtn');
  var submitNote = document.getElementById('gcSubmitNote');
  var resultSection = document.getElementById('result');

  if (!form) return;

  function answeredCount() {
    var count = 0;
    for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
      if (form.querySelector('input[name="q' + i + '"]:checked')) count++;
    }
    return count;
  }

  function updateProgress() {
    var count = answeredCount();
    progressCount.textContent = count;
    progressFill.style.width = (count / TOTAL_QUESTIONS * 100) + '%';

    if (count === TOTAL_QUESTIONS) {
      submitBtn.disabled = false;
      submitNote.textContent = 'All 10 answered. See your result below.';
    } else {
      submitBtn.disabled = true;
      var remaining = TOTAL_QUESTIONS - count;
      submitNote.textContent = 'Answer all 10 questions to see your result — ' + remaining + ' remaining.';
    }
  }

  form.addEventListener('change', updateProgress);
  updateProgress();

  function levelForAverage(avg) {
    var rounded = Math.round(avg);
    if (rounded < 0) rounded = 0;
    if (rounded > 2) rounded = 2;
    return LEVEL_LABELS[rounded];
  }

  function bandForScore(score) {
    for (var i = 0; i < BANDS.length; i++) {
      if (score >= BANDS[i].min && score <= BANDS[i].max) return BANDS[i];
    }
    return BANDS[BANDS.length - 1];
  }

  function computeResults() {
    var total = 0;
    var dimResults = DIMENSIONS.map(function (dim) {
      var sum = 0;
      dim.questions.forEach(function (qNum) {
        var checked = form.querySelector('input[name="q' + qNum + '"]:checked');
        var val = checked ? parseInt(checked.value, 10) : 0;
        sum += val;
        total += val;
      });
      var avg = sum / dim.questions.length;
      return {
        name: dim.name,
        level: levelForAverage(avg)
      };
    });

    return { total: total, dimResults: dimResults };
  }

  function renderResults() {
    var results = computeResults();
    var band = bandForScore(results.total);

    document.getElementById('gcResultNumber').textContent = results.total;
    document.getElementById('gcResultBand').textContent = band.name;
    document.getElementById('gcResultBandCopy').textContent = band.copy;

    var dimScoresEl = document.getElementById('gcDimScores');
    dimScoresEl.innerHTML = '';
    results.dimResults.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'gc-dim-score level-' + d.level.toLowerCase();
      var nameEl = document.createElement('span');
      nameEl.className = 'gc-dim-score-name';
      nameEl.innerHTML = d.name;
      var valEl = document.createElement('span');
      valEl.className = 'gc-dim-score-value';
      valEl.textContent = d.level;
      el.appendChild(nameEl);
      el.appendChild(valEl);
      dimScoresEl.appendChild(el);
    });

    resultSection.classList.add('is-visible');
    resultSection.setAttribute('data-score', results.total);
    resultSection.setAttribute('data-band', band.name);

    document.dispatchEvent(new CustomEvent('evostr:gap_check_complete', {
      detail: { score: results.total, band: band.name }
    }));

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (answeredCount() < TOTAL_QUESTIONS) return;
    renderResults();
  });

  /**
   * Optional "email me this result" capture — Mailchimp JSONP subscribe,
   * same list as the footer newsletter, with SCORE/BAND passed as merge fields.
   * NOTE: this only subscribes the visitor and stores the score/band as merge
   * data. Actually emailing them their result requires a Mailchimp automation
   * keyed off those merge fields — that has to be configured on the Mailchimp
   * side, this form alone can't send that email.
   */
  var emailForm = document.getElementById('mc-form-gapcheck');
  if (emailForm) {
    var BASE_URL =
      'https://quinngrowthadvisors.us2.list-manage.com/subscribe/post-json' +
      '?u=5692e46898c5e3c0bd1785643' +
      '&id=d8f0e78715';

    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById('gapcheck-email').value.trim();
      if (!email) return;

      var msg = document.getElementById('mc-message-gapcheck');
      var score = resultSection.getAttribute('data-score') || '';
      var band = resultSection.getAttribute('data-band') || '';

      var callbackName = 'mcCbGapCheck_' + Date.now();
      var url =
        BASE_URL +
        '&f_id=0073abe0f0' +
        '&EMAIL=' + encodeURIComponent(email) +
        '&SCORE=' + encodeURIComponent(score) +
        '&BAND=' + encodeURIComponent(band) +
        '&c=' + callbackName;

      var script = document.createElement('script');

      window[callbackName] = function (data) {
        if (msg) {
          msg.style.display = 'block';
          if (data.result === 'success') {
            msg.textContent = "You're on the list — check your inbox.";
            msg.style.color = 'var(--oak)';
            emailForm.reset();
            document.dispatchEvent(new CustomEvent('evostr:newsletter_subscribe', {
              detail: { form: 'gap_check_result', score: score, band: band }
            }));
          } else {
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
})();
