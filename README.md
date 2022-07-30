# game-logic

All the things! - All abstract game logic by Rick Love.

### Game content?

No game content - just logic.

Game content will be limited to vectors, rects, etc.

### Ambigious Much?

Yeah, well it will just have everything as a mono-repo that can be used as modules in any game.

### Cross Languange?

Well, I'll write it in typescript.

I think I'll make a typescript -> C# transpiler so it will work in Unity.

### Why typescript?

Because it's the most productive languange.

It's faster for me to write it once in typescript and built a transpiler for other languanges for performance.

### But it won't be fast!

1. just-js is the fastest http server that exists - it was written in javascript
2. If I transpile it to a fast languange, then I can optimize it for that languange.
    - In typescript, I could use a string union type, but in the target languange I could turn that into an enum.
    - In typescript, I could use array functions like filter and map with arrow functions, but in a target languange, it might turn into a plain for loop with inline logic.
    - I can output multiple possibilities and measure the ideal performance
        - Is it better to use a stack or heap type?
        - Is it better to use a for or foreach?
3. Languange speed is usually not the problem, it's your algorithms that are slow. Good code will be fast in any languange, and then it can be even more awesome.
4. Garbage Collection!
    - I use mostly immutable variables which have a well defined lifetime (i.e. it would be easy to add instructions to dispose them.)
    - Fast typescript shouldn't produce much garbage anyway
5. React?
    - Yeah, abusing react can be slow, but it's still the best UI paradigm I've ever seen (I do have a bit of experience).
    - I can translate react to any target UI framework, since I'm transpiling anyway.
    - Anyway, the UI isn't a focus of this repo, except for the debugging tools.

### That's crazy - you won't do it!

Oh well, I'll have fun

