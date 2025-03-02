---
layout: docs
title: API reference - Web Applets
---

# AppletFactory

This is the main entry point for both connecting to existing applets (from the host app) and registering new ones (from within an applet).

It is implemented by the `applets` object, which is either imported from the `@web-applets/sdk` node module, or part of the global scope if you've imported the Web Applets polyfill.

## Instance methods

### AppletFactory.connect()

Connects from a parent window to an applet that's running inside a child window (such as an iframe's `contentWindow` or a webview), and returns an Applet object representing the applet for the parent window.

The parent window uses this method to establish a communication channel with the child window containing the applet implementation.

#### Syntax

```js
connect(window);
```

#### Parameters

`window`: A `Window` object containing the applet

#### Return value

A `Promise` that resolves to a new instance of `Applet` that provides access to the applet's actions and data from the parent window.

#### Exceptions

Throws an `AppletConnectionError` if the connection times out before it can be established.

### AppletFactory.register()

Creates and returns a new AppletScope object within the child window, which represents the applet implementation and lets the host (parent window) know it's ready for connection.

This method is called from within the applet's own window and checks for a `<link rel="manifest" href="...">` tag, then instantiates the applet's properties and actions based on the contents of the manifest.

#### Syntax

```js
applets.register();
```

#### Parameters

None.

#### Returnvalue

An `AppletScope` object representing the applet and its properties.
