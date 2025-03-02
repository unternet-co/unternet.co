---
layout: docs
title: Web Applets documentation
tags: docs
eleventyNavigation:
  key: Introduction
---

# Introduction to Web Applets

Web Applets is an open specification for building software that both humans and AI can understand and use together. Instead of forcing AI to operate traditional point-and-click apps built for humans, Web Applets creates a new kind of web software designed for human-AI collaboration.

## Why?

[Unternet](https://unternet.co) is building a new, intelligent user agent that can do things for you across the web. As part of that effort, we needed a way to actuate an embedded web app. You can do this with a computer use model, but for many use cases it's not suitable to point and click around in a virtual browser. Why make a computer talk to another computer via a clumsy web interface when they can just talk directly?

Web Applets lets you define a simple, computer-readable API for a web app running in a browser, webview, or iframe. You can send it actions as JSON objects, which an LLM can easily create (see [OpenAI's structured JSON endpoint](https://openai.com/index/introducing-structured-outputs-in-the-api/)), and they can update their UI instantly in-place. Plus, you can expose the internal state of the applets to the model so you can do cool stuff like chat to a map.

We wanted anyone to be able to build these actions into their own third-party applets and distribute them. So, we extended the web & made it available to everyone!

<!-- include how works -->
