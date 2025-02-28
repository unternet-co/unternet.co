---
layout: docs
title: API reference - Web Applets
---

# AppletFactory

This is the main entry point for both connecting to existing applets (from the host app) and registering new ones (from within an applet).

It is implemented by the `applets` object, which is either imported from the `@web-applets/sdk` node module, or part of the global scope if you've imported the Web Applets polyfill.

## Instance methods

### AppletFactory.connect()

```js
connect(window);
```

Connects from a parent window to an applet that's running inside a child window (such as an iframe's `contentWindow` or a webview), and returns an Applet object representing the applet for the parent window.

The parent window uses this method to establish a communication channel with the child window containing the applet implementation.

Throws an `AppletConnectionError` if the connection times out before it can be established.

#### Parameters

`window`: A `Window` object containing the applet

#### Return value

A `Promise` that resolves to a new instance of `Applet` that provides access to the applet's actions and data from the parent window.

### AppletFactory.register()

```js
register();
```

Creates and returns a new AppletScope object within the child window, which represents the applet implementation and lets the host (parent window) know it's ready for connection.

This method is called from within the applet's own window and checks for a `<link rel="manifest" href="...">` tag, then instantiates the applet's properties and actions based on the contents of the manifest.

#### Parameters

None.

#### Returnvalue

An `AppletScope` object representing the applet and its properties.

# Applet

The `Applet` class represents the interface through which the parent window interacts with an applet running in a child window. It is returned by the `AppletFactory.connect()` method and provides access to the applet's properties, data, and actions.

## Constructor

### Applet()

Creates a new `Applet` instance that communicates with the specified child window. Don't use this directly, this class should only be instantiated through the `applets.connect()` method.

#### Parameters

`targetWindow`

A `Window` object where the applet is implemented (typically an iframe's content window).

## Instance methods

### Applet.sendAction()

```js
async sendAction(actionId, args)
```

Sends an action to the applet for execution.

#### Parameters

`actionId`

A `string` representing the identifier of the action to execute.

`args`

An `object` containing the arguments to pass to the action, or `undefined` if the action takes no arguments. This should fulfill the `params_schema` declared for the given action.

#### Return value

A `Promise` that resolves when the action has been sent to the applet.

#### Example

```js
applet.sendAction('search', {
  query: 'cafes in my neighbourhood',
});
```

## Instance properties

### Applet.data

Provides access to the current state of the applet's data. This object reflects the data defined in the applet implementation and is synchronized between the parent and child windows.

#### Value

Can be any value that is JSON-serializable.

#### Example

```js
/* In parent window */
applet.data = 'Hello world!';

/* In child window */
applet.ondata = (e) => console.log(e.data); // "Hello world!"
```

### Applet.window

A read-only reference to the child window where the applet is implemented.

#### Value

A `Window` object.

### Applet.manifest

Contains the parsed contents of the applet's manifest, as declared by the `<link rel="manifest" href="...">` tag in the child window. Declares the initial set of actions for the applet, and contains properties like descrition, name, etc.

#### Value

A read-only JSON object containing the web app manifest. If no manifest link is present, this will be an empty object.

### Applet.actions

A map of available actions that can be invoked on the applet.

#### Value

An `AppletActionMap` object.

### Applet.width

The current width of the applet in pixels.

#### Value

A `number`.

### Applet.height

The current height of the applet in pixels.

#### Value

A `number`.

## Events

### connect

An `AppletEvent`, which is dispatched when the connection with the applet is established successfully.

#### Properties

None.

#### Example

```js
applet.addEventListener('connect', (event) => {
  console.log('Applet connected successfully');
});
```

### actions

An `AppletEvent`, which is dispatched when the available actions of the applet change. This typically happens after initial connection or when the applet implementation adds or removes actions.

#### Event properties

`actions: AppletActionMap`

An object representing the updated actions.

#### Example

```js
applet.addEventListener('actions', (event) => {
  console.log('Applet actions updated:', event.actions);
});
```

### 'data'

An `AppletEvent`, which is fired when the applet's data changes. This occurs when the applet implementation updates its internal state.

#### Event properties

`event.data`

The data object, which can be any JSON-serializable value.

#### Example

```js
applet.addEventListener('data', (event) => {
  console.log('Applet data updated:', event.data);
});
```

## Usage example

The following example demonstrates how to connect to a maps applet, listen for events, and send an action:

```js
// Create an iframe
const iframe = document.createElement('iframe');
iframe.src = 'https://applets.unternet.co/maps';
document.body.appendChild(iframe);

// Connect to the applet in the iframe
iframe.onload = async () => {
  const applet = await applets.connect(iframe.contentWindow);

  // Listen for data changes
  applet.addEventListener('data', (event) => console.log(event.data));

  // Send an action
  applet.sendAction('search', { q: 'san francisco' });
```
