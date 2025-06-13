---
date: 2025-06-14
tags: posts
layout: post
title: 'Last month at Unternet: local-first, spreadsheets & product exploration'
author: Rupert
---

Hello! Rupert here from Unternet. I'm in Australia at the moment, and going deep on some product iteration, but wanted to share what's been going on the last few weeks.

## Local-first conf

On my way over to Sydney, I attended the [Local-First Conf](https://www.localfirstconf.com/) in Berlin. Not the best way to get from the west coast of the US to Australia, especially if you enjoy sleep or need to be conscious the next day. But it was well worth it.

Local-First was a very energetic gathering of like-minded people, all actively building a future of computing where users have real agency over their computers (which is deeply in the vibe wheelhouse of Unternet). The local-first community is solving for ditching the walled-garden platform model of computing, and turning data into something portable that you own completely, all while retaining essential networking features like instant syncing,  sharing, simultaneous editing, etc.

This is especially relevant to the future of AI – it's critical we don't create a future where a small number of platforms have a monopoly on our context, and refuse to share it. Also – the more open & interoperable we can make our documents and data, the more amazing experiences we will be able to create on top!

<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:4qsyxmnsblo4luuycm3572bq/app.bsky.feed.post/3lqeuvidrv22p" data-bluesky-cid="bafyreiekp7ickvp4tof62scapqqbrw7d5mgz7c2vo7nuo5wxuidypgwblq" data-bluesky-embed-color-mode="system"><p lang="en">The real bottleneck for useful AI isn’t just model quality.
It’s the walls around our data.
A thread on walled gardens, economic incentives, and why even the best models can’t help us if they can’t see us. 🧵</p>&mdash; Chad Fowler (<a href="https://bsky.app/profile/did:plc:4qsyxmnsblo4luuycm3572bq?ref_src=embed">@chadfowler.com</a>) <a href="https://bsky.app/profile/did:plc:4qsyxmnsblo4luuycm3572bq/post/3lqeuvidrv22p?ref_src=embed">May 30, 2025 at 7:05 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

I had a bunch of conversations about syncing data, web-scale identity, writing a formal web standard spec, and the future of browsers. Shout out to the [User & Agents](https://userandagents.com/) organizers who put together a fantastic post-conference hack session (with some great demos by Dietrich Ayalla, Orion Reed, and others). 

(BTW – [talks just got published](https://www.youtube.com/watch?v=KMcmMm8v5_E&list=PL4isNRKAwz2MabH6AMhUz1yS3j1DqGdtT), so go check them out!)

## Spreadsheets

New on the applets front, we've added a spreadsheet. (Meaning that I'm pretty sure web applets [is now turing-complete](https://www.infoq.com/articles/excel-lambda-turing-complete/)?) Anyway, this is one of those tools that's fun to play with in the inspector, and will be especially useful when embedded in an environment with lots of context & data. You can easily hook it up to your app using our SDK.

![A spreadsheet applet filling out cells in response to natural language queries, in the Inspector](/assets/blog/2025-06-spreadsheet-applet.gif)

## Local applets & files

The upcoming build of our chat client supports adding local applets. That means you can build an applet into a folder on your computer (or just write a little html file), and instantly start using a new web applet without having to worry about hosting or local dev servers. That will make it way easier to create new tools for your workflows in our future releases.

![A settings page for adding local applets](/assets/blog/2025-06-local-applets.png)

We also have a *bleeding edge* feature where you can index local files on your machine. For example, you might want to add a folder of markdown notes as a resource that the client can search through (especially useful if you're an Obsidian user) – now you can. This one isn't fully baked, but is fun to try, and we'll be increasing reliability over time.

## Interface experiments

I posted a series of gifs a few weeks ago of a new user interface I'm experimenting with for working across your apps, documents and the web, which I demoed at the User & Agents meetup. There's a bit more to say on this, and the future shape of our product, but I'll save that for next time!

For now, just some little demos.

<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:sayzq5w7jzdk37zpymik474f/app.bsky.feed.post/3lq246xjngr2m" data-bluesky-cid="bafyreib6twt7jl5rvlho4s7eihjh2ru4jpvrpot2amqvkuz2u5xqbvuvq4" data-bluesky-embed-color-mode="system"><p lang="">Fun experiment today making a command line for the web, based on Unternet&#x27;s kernel

It&#x27;s cool that the LLMs know enough about URL structure to hallucinate stuff that works!

(It&#x27;s just guessing based on what it knows about how GitHub&#x27;s paths work – it&#x27;s actually kinda handy)<br><br><a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lq246xjngr2m?ref_src=embed">[image or embed]</a></p>&mdash; Rupert Manfredi (<a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f?ref_src=embed">@ruperts.world</a>) <a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lq246xjngr2m?ref_src=embed">May 26, 2025 at 12:16 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:sayzq5w7jzdk37zpymik474f/app.bsky.feed.post/3lq5yl4ms3f26" data-bluesky-cid="bafyreih7pysjnkz4zzczv4pslnptrgrw5evdm5n2kzqqqqwo6lrbsagme4" data-bluesky-embed-color-mode="system"><p lang="">This little web command client can now take actions using Web Applets &amp; the Unternet kernel

love how it can reads the map pin data to recommend me a vegetarian spot (can&#x27;t do that with the DOM or a vision model)<br><br><a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lq5yl4ms3f26?ref_src=embed">[image or embed]</a></p>&mdash; Rupert Manfredi (<a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f?ref_src=embed">@ruperts.world</a>) <a href="https://bsky.app/profile/did:plc:sayzq5w7jzdk37zpymik474f/post/3lq5yl4ms3f26?ref_src=embed">May 28, 2025 at 1:22 AM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>