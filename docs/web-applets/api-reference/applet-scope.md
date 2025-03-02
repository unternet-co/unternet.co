---
layout: docs
title: API reference - Web Applets
---

# AppletScope

The `AppletScope` class represents the interface for an applet's implementation in a child window. It handles communication with the parent window, manages action handlers, and maintains the applet's state.

## Constructor

### AppletScope()

Creates a new `AppletScope` instance and initiates connection with the parent window.

#### Syntax

```js
const applet = new AppletScope();
```

#### Parameters

None.

## Instance methods

### AppletScope.setActionHandler()

Registers a handler function for a specific action that's already been declared, either with the <a href="manifest">manifest.json</a> or through `defineAction()`.

#### Syntax

```js
setActionHandler(actionId, handler);
```

#### Parameters

`actionId`

A `string` representing the identifier of the action.

`handler`

A function that will be called when the action is triggered. The function will receive the action arguments as its parameter.

#### Return value

None.

#### Example

```js
applet.setActionHandler('search', async (args) => {
  const results = await searchDatabase(args.query);
  applet.data = results;
});
```

### AppletScope.defineAction()

Defines a new action with its properties and optional handler.

#### Syntax

```js
defineAction(actionId, definition);
```

#### Parameters

`actionId`

A `string` representing the identifier of the action.

`definition`

An object containing the action definition and an optional handler function. The definition should include:

- `title` &mdash; a string containing a user-readable title for the action
- `description` &mdash; a description of the action for the model
- `params_schema` &mdash; a JSON Schema object declaring the schema of parameters to fulfil when calling this action

#### Return value

None.

#### Example

```js
applet.defineAction('search', {
  title: 'Search',
  description: 'Search for items matching the query',
  params_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
    },
    required: ['query'],
  },
  handler: async (args) => {
    const results = await searchDatabase(args.query);
    applet.data = results;
  },
});
```

## Instance properties

### AppletScope.data

Provides access to the current state of the applet's data. When modified, this property automatically synchronizes the data with the parent window.

#### Value

Can be any value that is JSON-serializable.

#### Example

```js
/* In child window */
applet.data = { results: ['Item 1', 'Item 2'] };

/* Data will be automatically synchronized with parent window */
```

### AppletScope.actions

A map of available actions defined for the applet.

#### Value

An `AppletActionMap` object. When modified, this property automatically notifies the parent window of the updated actions.

### AppletScope.manifest

Contains the parsed contents of the applet's manifest.

#### Value

A read-only applet manifest JSON object.

### AppletScope.actionHandlers

A map of registered action handler functions.

#### Value

An `AppletActionHandlerMap` object.

### AppletScope.width

The current width of the applet in pixels.

#### Value

A read-only `number`.

### AppletScope.height

The current height of the applet in pixels.

#### Value

A read-only `number`.

## Events

### connect

An `AppletEvent`, which is dispatched when the connection with the parent window is established successfully.

#### Properties

None.

#### Example

```js
applet.addEventListener('connect', (event) => {
  console.log('Connected to parent window');
});
```

### actions

An `AppletEvent`, which is dispatched when the available actions of the applet change.

#### Event properties

`actions: AppletActionMap`

An object representing the updated actions.

#### Example

```js
applet.addEventListener('actions', (event) => {
  console.log('Actions updated:', event.actions);
});
```

### data

An `AppletEvent`, which is fired when the applet's data changes.

#### Event properties

`event.data`

The data object, which can be any JSON-serializable value.

#### Example

```js
applet.addEventListener('data', (event) => {
  console.log('Data updated:', event.data);
});
```
