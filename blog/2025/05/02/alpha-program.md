---
date: 2025-05-03
tags: posts
layout: post
title: 'Kicking off our alpha program'
author: Rupert
---

In March, we shipped a stable version of [Web Applets](http://localhost:1234/docs/web-applets/introduction/), a protocol that extends the web to make it possible for agents and websites to communicate, with just a few lines of JavaScript.

<!--to interact directly with web apps, by adding just few lines of JavaScript.-->

We have an [Inspector](/docs/web-applets/resources/inspector/) for creating & debugging these applets, so you can build your own and see what it feels like to have a model read from and send actions to a live running app (check out the 3D scene generator demo below).

<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:sayzq5w7jzdk37zpymik474f/app.bsky.feed.post/3lk7byru5y22z" data-bluesky-cid="bafyreig2nx7r6lmzjfbwffyitcpbiui5wieakgintcjzxzocoopzps2l6i" data-bluesky-embed-color-mode="system"><p lang="en">We just released Web Applets 0.2!

It allows you to make client-side web apps that can be used by any LLM (it&#x27;s an open protocol).

For example this 3D scene generator (made in 20 LOC)

unternet.co/blog/2025/03...<br><br><a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lk7byru5y22z?ref_src=embed">[image or embed]</a></p>&mdash; Rupert Manfredi (<a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f?ref_src=embed">@ruperts.world</a>) <a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lk7byru5y22z?ref_src=embed">March 12, 2025 at 12:12 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

The Inspector is fun, and useful for development. But really, web applets aren't meant to live in an inspector &mdash; they're meant for a new kind of *intelligent user agent* that helps people do meaningful work on their computers with more flexibility and natural interaction.

Over the last six weeks, we've been hard at work building [a reference client](https://github.com/unternet-co/client), which allows folks to use web applets as part of a larger workflow weaving together natural language input, search, and rich app interaction in one place. 

We now have the initial foundation of this client ready to start testing. It's the "command-line" version of our future GUI vision: limited, and mainly text-based, but with the internals needed to expand to a full-blown operating system for the web. Underneath the hood is our [cognitive kernel](https://github.com/unternet-co/client/tree/main/kernel), which can be adapted by developers to easily get started with their own web applet clients.

![A screenshot of Unternet's new client, showing a user query, web tool use, and a text response with hyperlinks.](/assets/blog/2025-05-undo-screenshot.png)

Importantly, this client can now be installed on other people's computers (at last, [thank you Apple](/blog/2025/04/09/apples-kernels)). That means that we're kicking off a our alpha program, and will be expanding access as we iron out initial bugs and finalize support for applets & web interactions.

You can join our alpha program [here](https://tables.unternet.co/form/LFAXuf6N5Wllq76YE4IMeEdLvyWzvJG78FipIeSeQXQ). I think maybe we'll call it *Unternet Explorers*? There will be stickers & mission patches.

And of course, the [source code is open](https://github.com/unternet-co/client) for those willing to get their hands dirty and build it themselves, but it may be missing a few features until we do a public release.

## Auto-updates

Auto-updating is one of the many things you need to get working in order to ship a proper desktop app to production. Unlike building for the web, desktop apps don't magically update every time a user opens them.

Which means that&mdash;without auto-updates&mdash;you need to convince your user to click a link, download a new version, pull it into their Applications folder, and restart. That's a lot of work, especially for an app that has updates a few times a week.

Enter:  [autoUpdater](https://www.electronjs.org/docs/latest/api/auto-updater), an Electron package that handles the app update process across platorms. 

Here's how it works: whenever we build a new version of the app, our build system updates an [RSS feed](https://aboutfeeds.com/) with the version number, platform, release date, and a download link. We point autoUpdater to this feed, which it regularly polls for changes. Whenever it sees a new version, it triggers a download and handles the installation. 

When it's all wired up, it's a bit magical. We can make changes to the code, test and review them, then run a command to begin a new deployment. This triggers our cloud build process for macOS, Windows & Linux.

![](/assets/blog/2025-05-build-spinners.gif)

Then, within the next five minutes, all of our users will see something like this:

![](/assets/blog/2025-05-build.gif)

It's very satisfying, and an important part of the iterative feedback loop we're spinning up with our alpha program. We can have a conversation with a user, start work on a new feature or bug for them, and have it deployed to their machine within minutes.

Our work on cross-platform app builds & auto-updating was led by Vinay from our team, and Vincent from [Hypha](https://hypha.coop/).

## In other news...

- Rupert spoke about the future of open-source AI & the web as part of [GLOSAIC](https://glosaic.org/) – you can catch the interview [here](https://x.com/i/broadcasts/1BdGYqVVDQlGX) @ 4:11.
- Vinay & Rupert are heading to NYC for a week from the 5th. We'll be hacking at Betaworks in the meatpacking district. Let us know if you'd like to catch up, or if there's someone we should meet!