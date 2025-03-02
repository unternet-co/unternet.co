---
layout: docs
title: API reference - Web Applets
---

# AppletFrame

The `<applet-frame>` element is a custom HTML element that provides a container for embedding and interacting with applets. It handles the connection to the applet, manages communication, and automatically resizes based on the applet's dimensions.

## Usage

HTML:

```html
<applet-frame src="path/to/applet.html"></applet-frame>
```

## Attributes

### src

The URL of the applet to load in the frame.

#### Value

A `string` representing the URL.

#### Example

```html
<applet-frame src="https://example.com/applet"></applet-frame>
```

## Instance properties

### AppletFrame.src

Gets or sets the URL of the applet to load. Setting this property triggers the loading of a new applet.

#### Value

A `string` representing the URL.

#### Example

```js
// Get the current URL
const url = frame.src;

// Set a new URL and load the applet
frame.src = 'https://example.com/new-applet';
```

### AppletFrame.applet

Provides access to the `Applet` instance that represents the connection to the embedded applet.

#### Value

An `Applet` object or `undefined` if no applet is connected.

#### Example

```js
// Access the applet's data
const data = frame.applet.data;

// Send an action to the applet
frame.applet.sendAction('search', { query: 'example' });
```

### AppletFrame.data

Sets the data to be synchronized with the applet. If the applet is not yet loaded, the data will be set once the applet is ready.

#### Value

Can be any value that is JSON-serializable.

#### Example

```js
// Set data to be synchronized with the applet
frame.data = { items: ['Item 1', 'Item 2'] };
```

### AppletFrame.container

A reference to the internal iframe element that contains the applet.

#### Value

An `HTMLIFrameElement` or `undefined` if the element is not yet initialized.

### AppletFrame.ready

Indicates whether the applet is ready for interaction.

#### Value

A `boolean` or `undefined`.

## Events

### load

Fired when the applet has been loaded and the connection has been established.

#### Properties

None.

#### Example

```js
frame.addEventListener('load', (event) => {
  console.log('Applet loaded successfully');
});
```

### actions

Fired when the available actions of the applet change.

#### Event properties

`actions: AppletActionMap`

An object representing the updated actions.

#### Example

```js
frame.addEventListener('actions', (event) => {
  console.log('Applet actions updated:', event.actions);
});
```

### data

Fired when the applet's data changes.

#### Event properties

`event.data`

The data object, which can be any JSON-serializable value.

#### Example

```js
frame.addEventListener('data', (event) => {
  console.log('Applet data updated:', event.data);
});
```

### resize

Fired when the applet's dimensions change.

#### Event properties

`width: number`

The new width of the applet in pixels.

`height: number`

The new height of the applet in pixels.

#### Example

```js
frame.addEventListener('resize', (event) => {
  console.log('Applet resized:', event.width, event.height);
});
```
