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

    console.log('Sending event:', data);  // Debug log

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors'
    })
    .then(response => response.json())
    .then(result => console.log('Event recorded:', result))  // Debug log
    .catch(error => console.error('Error sending event:', error));
  }

  function trackPageView() {
    console.log('Tracking pageview');  // Debug log
    sendEvent('pageview');
  }

  // Track initial pageview with a small delay
  setTimeout(trackPageView, 100);

  // Track pageviews on history changes
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    trackPageView();
  };
  window.addEventListener('popstate', trackPageView);

  // Expose the sendEvent function globally
  window.sendAnalyticsEvent = sendEvent;

  console.log('Analytics script loaded');  // Debug log
})();