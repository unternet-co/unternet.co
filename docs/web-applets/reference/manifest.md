---
layout: docs
title: API Reference - Web Applets
---

# Manifest

The `manifest.json` file is an important extension to the Web App Manifest spec, which declares metadata about the applet that clients and crawlers can access without having to load the applet in the browser.

While you can define actions dynamically in code with `AppletContext.defineAction()`, writing a manifest allows a client to see available starting actions for an applet without having to load the JavaScript directly. We expect this to be important when indexing the web for applet functionality

> We recommend creating a manifest for every applet you publish, and including all initial actions.

## Detecting the manifest

In accordance with the Web App Manifest spec, the manifest is discoverable through a `<link rel="manifest">` tag on your applet's webpage. The manifest itself can live anywhere on your site, so long as you provide the correct `href` value.

You must declare your manifest in your applet's html with a link tag in order for it to be discoverable:

```html
<link rel="manifest" href="manifest.json" />
```

You can also pass a JSON object that corresponds to the manifest spec to the `applets.register()` function, if you don't want to declare a `manifest.json` and are not planning on publishing your applet to the web.

## Specification

The Web Applets manifest file is a lightweight extension of the Web App Manifest, with the inclusion of an `actions` key, which contains a dictionary of action IDs (`string`) mapping to `AppletActionDescriptor` values.

## Example

Here's an example manifest object:

```json
{
  "name": "Calculator",
  "short_name": "Calc",
  "description": "Calculate something precisely",
  "icons": [
    {
      "src": "icon-512x512.png"
    }
  ],
  "entrypoint": "index.html",
  "actions": {
    "calculate": {
      "title": "Calculate",
      "description": "Calculate an expression, or short piece of mathematical code",
      "params_schema": {
        "type": "object",
        "properties": {
          "expr": {
            "type": "string",
            "description": "A valid javascript expression to evaluate, no other text but javascript."
          }
        },
        "required": ["expr"]
      }
    }
  }
}
```
