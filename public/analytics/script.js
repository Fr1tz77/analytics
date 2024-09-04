(function() {
  var currentScript = document.currentScript;
  var apiEndpoint = 'https://analytics-tan-psi.vercel.app/api/analytics/record-event';

  function sendEvent(eventName, eventData) {
    var data = {
      name: eventName,
      url: window.location.href,
      referrer: document.referrer || null,
      domain: currentScript.getAttribute('data-domain'),
      ...eventData
    };

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors'
    }).catch(console.error);
  }

  function trackPageView() {
    sendEvent('pageview');
  }

  // Track initial pageview
  trackPageView();

  // Track pageviews on history changes
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    trackPageView();
  };
  window.addEventListener('popstate', trackPageView);

  // Expose the sendEvent function globally
  window.sendAnalyticsEvent = sendEvent;
})();