---
date: 2025-03-11
tags: posts
layout: post
title: 'Announcing Web Applets 0.2'
---

**Today we're launching Web Applets 0.2!**

This is a major improvement to the Web Applets API, and a big step towards our 1.0 release, making it simple and easy to build apps for the web that give your AI tools new superpowers.

A few key changes:

- We've streamlined the API, ironed out common gotchas for developers, and added important production features like error handling
- A new & improved Inspector makes it easy to test out & experiment with your applets, now with a chat sidebar
- We now have thorough API documentation, examples, concepts and a reference, all available [in our docs](/docs/web-applets/introduction/)
- It's now easier than ever to integrate Web Applets into any project you're doing for the web (you can even add the polyfill to your existing site and apps)

Here's an example of code from an applet that writes _"hello"_ on the screen when an action is received from the model, to give you a feel:

```javascript
import { applets } from '@web-applets/sdk';

const self = applets.register();

self.defineAction('say_hello', {
  handler: () => (document.body.innerText = 'Hello!'),
});
```

To celebrate our release, Vinay whipped up a cool crossword sovler demo! To try it out, in your terminal (with node installed) run `npx @web-applets/inspector` and enter in the crossword applet URL (you can find that in [our directory](/directory)).

![](/assets/blog/2025-03-crossword-demo.gif)

If you want to learn to develop one together, here's a 4-minute tutorial building a 3D scene generator from scratch, which allows you to chat to an LLM to construct a 3D scene using only natural language. It's quite fun (also great if you have kids)!

<iframe width="100%" height="380" src="https://www.youtube.com/embed/ZsadocyGj3I?si=YosPjtJ_vlb-0o7M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

At this stage, the API is nearing production-readiness, and we invite you to start building your own AI-native apps, hosting them on the open web, and experimenting with [making your own clients & chat UIs](http://localhost:1235/docs/web-applets/quickstart/#client) to run them.

If you make something cool or have feature suggestions, [jump into the Discord](https://discord.com/invite/VsMuEKmqvt) and let us know.
