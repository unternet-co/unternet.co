---
layout: docs
title: Quickstart - Web Applets
tags: docs
eleventyNavigation:
  key: Quickstart
---

# Getting started

We are excited for you to build your first applet. Let's dive in!

## What we will be building

You will be building a simple applet that says hello when we send it an action. This tutorial will walkthrough how an applet communicates with an external source and is able to pass data through the communication protocol. In addition, we will cover integrating the SDK to a web app, inspecting it during development, building and deploying it so you get a feel for the end to end process. Let's get started!

![](/assets/docs/run-your-applet.png)

## Setup

Let's start with a typical web app template, using Vite and TypeScript.

```
mkdir my-applet && cd my-applet
npm init
npm install -D vite
```

**Folder structure**

```
.
├── index.html
├── package-lock.json
├── package.json
├── public
│   ├── icon-128x128.png
│   └── manifest.json
├── src
│   └── main.ts
└── vite.config.js
```

This is a simple single page app that is loaded on the main page `index.html`. The index page loads 2 files:

1. A manifest file in the public directory - This is a standard [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest), typically used to give browers and operating systems metadata about a web app when it's installed. We've extended the manifest spec to describe applet features like actions.
2. A JS module - `main.ts` This is where we will be adding code to define the functionality of our applet.

## Add some functionality

Let's look at how to define actions. We will define a `set_name` action in our manifest file, which our applet will use to update the name that's displayed in the UI. Open the manifest file and see the `actions` section. It should look like the following:

```jsx
{
  // ...
  "actions": {
    "set_name" {
      "description": "Sets the name of the user.",
      "params_schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

In the actions object in our manifest file, we are providing information about our action such as an ID, description and the parameters it will accept. Our action, as per this definition, expects an object with the key `name` and a string value.

```jsx
{
  name: 'some name here';
}
```

### Modify the view

So far we have only defined the action. We need to create a view that will respond to this action. Let's take a look at our `index.html`. We have a `<span>` with an `id`. This is where we'll take the `name` value we receive from the action to update the view.

```jsx
Hello! <span id="name">whoever you are</span>.
```

### Modify the script

So far we have defined an action and created a placeholder for it in the view. Let's connect the two. Open the `main.ts` file. You will notice a few things:

1. An `applets.getContext()` call - this will register our applet and provide us context. Context is where you can set data for the applet to use
2. `context.setActionHandler` This code adds an action handler that uses the context object and updates shared data
3. `context.ondata` callback function to be executed when new data is received. When we receive new data (name), we will query the `<span>` element we added by ID and update the inner text to reflect new data.

```jsx
import { applets } from '@web-applets/sdk';

const context = applets.getContext();

// Define a 'set_name' action, and make it update the shared data object with the new name
context.setActionHandler('set_name', ({ name }) => {
  context.data = { name };
});

// Whenever the data is updated, update the view
context.ondata = () => {
  const nameElement = document.getElementById('name');
  if (nameElement) {
    nameElement.innerText = context.data.name;
  }
};
```

With this you have all three pieces in place:

1. The manifest, where you define all your actions
2. A script that handles actions, mutates state, and updates the view
3. The HTML view, where new changes will be rendered

### Inspect your applet

While developing, it is helpful to have a way to test out your applet. We built an inspector that allows you to do just that. To install the inspector and run it in a separate port, type `npx @web-applets/inspector`. Click the link and you should see an empty page where you can load any applet to inspect.

![](/assets/docs/web-applets-inspector.png)

To inspect our applet, we need to run it. To get your applet running, run `npm run dev` in the applet's directory. Once running, let's enter our web applet's URL (`http://localhost:5173/`), in the inspector. You will see that the inspector loads the app on one side and displays all actions on the other side. Of course, we only have one action, but you can imagine how this would be beneficial when we have many.

![](/assets/docs/plain-inspector.png)

> **Good to know**: The inspector is a Node express server running on a different port and allows you to inspect your web app. It has some additional UI to test your actions easily.

Now that you have a handy way to test your actions, let's dispatch a sample event. In the params section, let's give it data in the format it expects.

```javascript
{
   "name": "Jane"
}
```

When you click "dispatch action", you can see the view layer respond according to the handler we had written.

![](/assets/docs/view-layer-responding.png)

Congratulations! 🎉

You just created a web applet that can respond to externally dispatched events in a meaningful way. This is a trivial example of how the message passing protocol works in action. Once your applet is embedded in the operator, it will be one of many apps that can respond to the user's actions and pass data to user's context in helpful ways.

### Build

Now that you have verified that the actions work as expected, you can build your application for distribution. Run `npm run build`. Vite should create a JS bundle and an HTML page for your applet.

### Deploy & use

Web applets are regular web apps, and can be hosted anywhere you would normally host static sites.(For example, [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)). Web applets can be embedded & used anywhere the SDK is accepted, for example our [official reference client](https://github.com/unternet-co/operator).

### Taking it forward

You can extrapolate this idea to define multiple actions that make sense to the applet you are creating. By having a list of actions that can be dispatched externally and writing your action handlers to respond to these events, you can create rich experiences for your consumers.

If you build something cool, [make a pull request](https://github.com/unternet-co/applets), so we can list your applet in the official directory for others to view and use.
