---
date: 2025-04-11
tags: posts
layout: post
title: 'Last month at Unternet: Apples & kernels'
author: Rupert
---

We've been spending the last few weeks putting together a stable version of our client, the AI-powered open web workspace we've been moving towards since the company started late last year.

While the functionality of our very first release will be limited, it will be feature complete for some real end-to-end workflows, be auto-updating, have enough stability for real work, and all that other essential stuff to create a solid base upon which to iterate.

## Kernel

A core piece of Unternet's client is its 'kernel'. We're borrowing an operating system word here, which typically applies to the component of an operating system that coordinates between applications and hardware components of a computer. Unternet's kernel instead coordinates between reasoning engines (language models) and running application processes like Web Applets (or native system services, API requests, etc).

The Unternet kernel is open-source, and built to be modular for developers to create their own LLM-powered application environments like ours. And unlike other orchestration systems, Unternet's kernel is designed to tackle multiple different "protocols" for actions – you can get your model to use regular functions, websites, Web Applets, APIs, MCP servers, etc. all using the same library. You can find our in-progress work on the kernel [here](https://github.com/unternet-co/client/tree/main/kernel), and we'll post a more in-depth article how it works in a later update.

The kernel already has basic tool-use capabilities, and recently our engineer Steven added local file support. Here's a short demo, using our example command-line interface:

![](/assets/blog/2025-04-kernel-camp-demo.gif)

## Apple

This week I've been learning a lot about certificates (not the congratulatory kind).

Before you can ship an app to Apple's coveted macOS, you need to ask their permission, receive a digital cryptographic certificate, and "sign" your app using it. Since Catalina, it is now [basically forbidden](https://support.apple.com/en-us/102445) to open an app that hasn't been notarized in this way.

That process has taken about 1.5 weeks longer than I initially anticipated (and counting). It looks something like this:

- Create a new Apple ID for the company & open a developer account
- Wait for Apple's third-party business registration consultant company to get in touch with you, then upload a bunch of docs to verify you are a real business
- Wait a few days, then get a notification that you now need to upload a bunch of documents to say you are a real person actually employed by the business (part of this proof is a business card?)
- Wait a ~~few days~~ 1 week or more...
- ??? probably something else

It's a far cry from the web (or more open OS's like Linux), where you can basically publish whatever you want, and right now it's our only hurdle to a limited release. We wait with bated breath.

## Auto-scroll element

One small bonus: we couldn't find a good "chat-style scroll" package online, that wasn't specific to a framework like React. This is a particular sort of scroll where content starts at the top of an element, then scrolls down automatically when it reaches the bottom.

We made one ourself using a CSS-based technique, and published it to NPM. You can check it out [here](https://github.com/unternet-co/auto-scroll/).
