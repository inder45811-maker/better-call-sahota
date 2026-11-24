'use client';

import { useState, useSyncExternalStore } from 'react';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';

const preferenceKey = 'bcs-analytics-opt-out';
const preferenceEvent = 'bcs-analytics-preference';

function analyticsEnabled() {
  try {
    return window.localStorage.getItem(preferenceKey) !== 'yes';
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

function useAnalyticsEnabled() {
  return useSyncExternalStore(subscribe, analyticsEnabled, () => false);
}

function filterAnalytics(event: BeforeSendEvent) {
  if (!analyticsEnabled() || event.type !== 'pageview') return null;
  const url = new URL(event.url, window.location.origin);
  return { ...event, url: url.origin + url.pathname };
}

export function SiteAnalytics() {
  const enabled = useAnalyticsEnabled();
  return enabled && <Analytics beforeSend={filterAnalytics} />;
}

export function AnalyticsPreference() {
  const enabled = useAnalyticsEnabled();
  const [error, setError] = useState(false);

  function toggle() {
    try {
      if (enabled) window.localStorage.setItem(preferenceKey, 'yes');
      else window.localStorage.removeItem(preferenceKey);
      window.dispatchEvent(new Event(preferenceEvent));
      setError(false);
    } catch {
      setError(true);
    }
  }

  return (
    <section
      id="analytics-preference"
      aria-labelledby="analytics-preference-heading"
    >
      <h2 id="analytics-preference-heading">Website analytics</h2>
      <p>
        Vercel Web Analytics helps us understand how often people visit, which
        pages they use and where visits come from. It uses no tracking cookies.
        We remove query strings and fragments from tracked page URLs.
      </p>
      <p>
        You can turn off analytics for this browser. Your preference is stored
        on this device.
      </p>
      <button type="button" className="button" onClick={toggle}>
        {enabled ? 'Turn off website analytics' : 'Turn on website analytics'}
      </button>
      <p role="status">
        {error
          ? 'Your browser could not save this preference.'
          : enabled
            ? 'Website analytics allowed in this browser.'
            : 'Website analytics off in this browser.'}
      </p>
    </section>
  );
}
