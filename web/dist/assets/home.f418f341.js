import{j as e,b as t,F as o,L as i,u as s,r as l}from"./index.c4074f42.js";import{b as c}from"./index.esm.f03bf15c.js";import{a as h,C as d}from"./index.esm.672f042a.js";/* empty css                   */function r(a){const n=Object.assign({h2:"h2",p:"p",a:"a",hr:"hr",h3:"h3"},a.components);return t(o,{children:[e(n.h2,{children:"Welcome to Elara"}),`
`,t(n.p,{children:[`Elara is a game that teaches you how to program. It is named after one of the
`,e(n.a,{href:"https://en.wikipedia.org/wiki/Elara_(moon)",children:"moons of Jupiter"}),`, where the bulk
of the game will take place.`]}),`
`,e(n.p,{children:`This is a very early build of the game! Things like story, artwork, music and
sound effects, and many gameplay features are not ready yet. There will be
significant changes before the final version of the game is ready to release,
and your feedback can help us get there \u{1F600}`}),`
`,e(n.p,{children:`Right now, we are focusing on testing the core mechanics of the game, which
includes writing code to control a rover and solve various puzzles. Click the
"Start" button to start playing!`}),`
`,`
`,e(i,{to:"/dialog/intro",children:t(h,{colorScheme:"green",children:[e("span",{children:"Start"}),e(c,{size:"1.3em",style:{marginLeft:"0.2rem"}})]})}),`
`,e(n.hr,{}),`
`,e(n.h3,{children:"About"}),`
`,t(n.p,{children:[`Elara uses a full-featured scripting language called
`,e(n.a,{href:"https://rhai.rs/book/ref/index.html",children:"Rhai"}),`, chosen because it is easy to learn,
runs efficiently, supports WebAssembly, and offers important safeguards such as
limiting the kind of code a user can write and preventing infinite loops. Almost
all of the features of the Rhai language are supported so feel free to read the
Rhai docs and play around a bit. The current levels are fairly simple, but
future updates will include more complex levels designed to teach you about
variables, control flow, user-defined functions, and other common programming
language features.`]}),`
`,t(n.p,{children:["The source code for Elara is ",e(n.a,{href:"https://github.com/albrow/elara",children:"available on GitHub"}),`.
If you already know a little bit about programming and find a bug somewhere, feel free
to open an issue.`]})]})}function u(a={}){const{wrapper:n}=a.components||{};return n?e(n,Object.assign({},a,{children:e(r,a)})):r(a)}function b(){const a=s();return l.exports.useEffect(()=>{document.title="Elara | Home"},[a]),e(d,{maxW:"container.xl",p:8,children:e("div",{className:"md-content",children:e(u,{})})})}export{b as default};
