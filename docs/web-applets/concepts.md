---
layout: docs
title: Concepts - Web Applets
---

# Concepts

The Web Applets protocol is implemented by a **client** (e.g. a browser, extension, or dedicated app) and an **applet** (which is a web app). Using this protocol, the Web Applets SDK establishes a connection allowing the host to send **actions** to the applet, and receive **data** when the applet's internal state is updated.

## What makes an applet?

At its core, an applet is any website that implements the Web Applets protocol. Applets do this by creating a connection with the host window, typically through `applets.register()`.

For example, this is an applet:

```html
<html>
  <head>
    <script src="web-applets.min.js"></script>
    <script>
      applets.register();
    </script>
  </head>
  <body></body>
</html>
```

This applet can now declare actions using <a href="/docs/web-applets/reference/applet-scope#defineAction">`defineAction()`</a>.

## Rendering an applet

Web Applets should be a simple addition to any web application rendering process, whether that's a basic HTML website, or a complex React application.

If you're building an applet to run as an embedded application (for example, an AI chat widget), we recommend using action handlers primarily as functions to update the `data` object. You can then update the view in the `data` event handler, ensuring applet state can be rehydrated when the page is reloaded.

```js
self.setActionHandler('search', async () => {
  this.data = await getSearchResults();
});

self.ondata = () => {
  renderView(self.data);
};
```

## Optimizing for model-legibility

## Security model

Web Applets is designed with security in mind. That's one of the reasons we architected the SDK to work with _websites_, instead of relying on importing ES modules or components directly. By using the web, we can leverage the existing browser same-origin security model.

If you're implementing a Web Applets client, we recommend you load applets in a <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/sandbox" target="_blank">sandboxed iframe</a>, or some other independent web scope. This ensures that running applets don't have same-origin permission to read resources like `localStorage`, `IndexedDB`, the active window's DOM, and other sensitive resources.
