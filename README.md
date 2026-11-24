# One Year Ago

> **Status: early prototype, still in development.** Things are rough, content is incomplete, and a lot will change.

A narrative walking game, "a story about looking for someone." Started as a Phaser.js entry for the AI Game Week 2026 hackathon (May 2026) and I'm still building it out.

**Play the prototype:** [https://anshuk-007.github.io/One-Year-Ago/](https://anshuk-007.github.io/One-Year-Ago/)

![Gameplay screenshot](add-screenshot-path-here.png)

## The idea

You wake up in a hospital after a coma, sure that she was here. You walk around, talk to people, and slowly piece together what happened. It's more of a story than a puzzle game. The goal is the feeling of figuring things out one piece at a time.

## What works right now

- **Four scenes:** the hospital, the street outside, the apartment interior, and a station. Each is its own scene, so adding a new place doesn't touch the others.
- **Dialogue system:** lines go into a queue and play one after another, with character portraits next to the text.
- **Memory system:** certain moments or objects trigger memories that fill in the story.
- **Phone and journal:** you can open both in-game and look through them.
- **Chapter One, "White Ceiling":** the first chapter is playable from the title screen.

## How it's built

The game is split into modular Phaser scenes:

```
HospitalScene
StreetScene
ApartmentInteriorScene
StationScene
```

Dialogue, memories, and the phone are shared systems that every scene calls into, instead of each scene doing its own thing. The main calls are:

| Function | What it does |
|---|---|
| `addDialogue` / `runDialogue` | Adds lines to the queue and plays them in order |
| `triggerMemory` | Fires a memory moment |
| `togglePhone` | Opens or closes the phone |

One rule I kept for the whole project: only use these real system functions. No made-up helpers, so everything stays consistent as scenes get added.

## Play it online

The prototype is deployed on GitHub Pages, so there's nothing to install. Open it in your browser: [https://anshuk-007.github.io/One-Year-Ago/](https://anshuk-007.github.io/One-Year-Ago/)

## Tech

- Phaser.js
- JavaScript
- Built with AI assistance: mostly Claude and ChatGPT, for code and [add if it also made the art, sprites, or dialogue]
- My part: story and concept, scene structure, design decisions, testing and fixing bugs

## Roadmap

This is a prototype, so the list is long. Rough plan, in order:

- [ ] **More story:** outline the memories the player finds and what each one reveals
- [ ] **Richer dialogue:** write lines scene by scene, with a different voice for each character
- [ ] **Better sprites:** start with the main character and the people who appear most
- [ ] **Bigger environment:** add new areas, each with a memory or a character in it

## Known issues

- **Sprites:** the sprite structure is still rough and needs to be cleaned up and made consistent across characters
- **Walking:** movement and animation are basic and need polish
- **Environment:** the scenes are small and simple, and the world is not very big yet
- **Detail:** scenes need more objects, background detail, and things to interact with
- **Story:** only a small part of the story is told so far, and more needs to come across through the dialogue, memories, and the world itself

## About

Made by Anshuk Chaturvedi for the Devpost AI Game Week 2026 hackathon (May 2026). Still in development.
