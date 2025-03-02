---
layout: docs
title: API Reference - Web Applets
---

**Note:** This API reference is pre-release, documents the alpha release of Web Applets (`npm install @web-applets/sdk@0.2.0-alpha.4`).

## Usage example

The following example demonstrates how to connect to a maps applet, listen for events, and send an action:

```js
// Create an iframe
const frame = document.createElement('applet-frame');
frame.src = 'https://applets.unternet.co/maps';
document.body.appendChild(frame);

frame.addEventListener('data', (event) => console.log(event.data));

// Once the applet loads, send it an action
// This will result in the map showing pins for our search results
iframe.addEventListener('load', () => {
  applet.sendAction('search', { q: 'breweries in sydney' });
});
```
