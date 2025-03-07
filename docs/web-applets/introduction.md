---
layout: docs
title: Web Applets documentation
tags: docs
eleventyNavigation:
  key: Introduction
---

# Introduction to Web Applets

Web Applets is an SDK, protocol and set of standards for building software that both humans and AI can understand and use together. It's built to be a light-weight layer over the existing web, that makes web apps legible to external systems, which can in turn send actions to them and receive data.

You can see a list of available web applets in our [Directory](/directory).

## Why?

[Unternet](https://unternet.co) is building a new, intelligent user agent that can do things for you across the web. As part of that effort, we needed a way to use client-side web software. You can do this with a computer use model, but for many use cases it's not suitable to point and click around in a virtual browser. Why make a computer talk to another computer via a clumsy web interface when they can just talk directly?

Web Applets lets you define a simple, computer-readable API for a web app running in a browser, or embedded webview or iframe. You can read possible actions with parameters in tool-use-compatible JSONSchema format, send them actions. In turn, applets can handle actions however they'd like, update ther interfaces, and respond with a data object that gives the LLM visibility on what's happening inside.

This allows you to do cool things &mdash; like drop pins on a map directly in an AI chat app, navigate a web page using your voice, or solve a crossword collaboratively with an AI.

## Let's keep our web open

**Unternet** is a **Public Benefit Corporation** with a mission to increase user agency &amp; software interoperability on the web.

We've been seeing this sort of AI-actuated software as an emerging use case for the future of computing. But if this functionality is reserved for proprietary integrations, or if one closed platform dominates above others, then the open web as we know it could be at risk.

We're open sourcing Web Applets because we believe that the future of the web needs to stay open. Web Applets can be implemented by any client, can be hosted anywhere on the web, and indexed by anyone.

## Getting started

To get stuck right into code, view the [Quickstart](/docs/web-applets/quickstart). We recommend you review Web Applets [Concepts](/docs/web-applets/concepts) before you start.

When you want to get further stuck in, you can take a look at our full [API reference](/docs/web-applets/reference).
