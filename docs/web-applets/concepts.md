---
layout: docs
title: Concepts - Web Applets
tags: docs
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

## Where can this be used?

Web Applets is designed to be used everywhere the web works.

We think a particularly compelling use case will be embedding small, focused, portable apps that exist within a larger **intelligent client** environment, allowing models to coordinate multiple applets in response to user queries.

However, there are also compelling use cases in **browsers** and **browser extensions** conducting actions on the active page (e.g. interacting with a design app using natural language), and web crawling (indexing a list of actions across all applets that can be taken across the web).

## Security model

Web Applets is designed with security in mind. That's one of the reasons we architected the SDK to work with _websites_, instead of relying on importing ES modules or components directly. By using the web, we can leverage the existing browser same-origin security model.

If you're implementing a Web Applets client, we recommend you load applets in a <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/sandbox" target="_blank">sandboxed iframe</a>, or some other independent web scope. This ensures that running applets don't have same-origin permission to read resources like `localStorage`, `IndexedDB`, the active window's DOM, and other sensitive resources.
