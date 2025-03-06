---
layout: docs
title: API Reference - Web Applets
---

# Web Applets reference

**Note:** This API reference is pre-release, documents the alpha release of Web Applets (`npm install @web-applets/sdk@0.2.0-alpha.4`).

The main entrypoint into the Web Applets API is through the `applets` object, which is an instance of `AppletFactory`. This object provides functions to initialize the applet runtime environment if you're developing an app:

- `applets.connect(window)`, for connecting with an applet that's running in a given `Window`. This returns an `Applet` object which allows you to read the applet's `data` object, and send it actions.
- `applets.register()`, which you'll use when creating your own applet. This reads the `manifest.json` file linked in the HTML, and connects with the parent window so it's ready to receive actions. It returns an `AppletScope` object, that allows you to define actions and action handlers, and set the `data` object.

## Usage examples

The following example demonstrates how to declare an applet that renders a map. Here we focus on the JavaScript, assuming certain map functions, as well as a manifest.json file and index.html file. For more details, see the [quickstart](/docs/web-applets/creating-an-applet).

```js
// Register the applet
const self = applets.register();

// Set an action handler
self.setActionHandler('search', ({ q }) => {
  const results = searchMap(q);
  self.data = { q, results };
});

self.addEventListener('data', (e) => {
  renderMap(self.data.results);
});
```

The following example demonstrates how to load up and embed this a maps applet from a parent window, listen for events, and send an action:

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
