import{E as V,G as K,r as o,z as Q,b as r,j as n,F as a,w as Z}from"./index.c4074f42.js";import{j as ee}from"./scenes.7fd70416.js";import{R as ne,C as te,E as re,P as oe}from"./control_bar.34b32b52.js";import{F as S,B as h,C as ie}from"./index.esm.672f042a.js";/* empty css                   */import"./index.esm.7fee85ea.js";import"./index.esm.f03bf15c.js";function d(t){const e={pos:V(),top:"0px",left:"0px"},g=K.new(),u=ee[0].initial_state,p=o.exports.useRef(()=>t.code),[i,H]=o.exports.useState(null),[A,x]=o.exports.useState(!1),[N,m]=o.exports.useState(!1),[I,f]=o.exports.useState(u),[R,b]=o.exports.useState(void 0),[Y,w]=o.exports.useState(void 0),B=o.exports.useCallback(c=>{p.current=c},[]),s=o.exports.useCallback(()=>{x(!1),m(!1),i&&i.stop(),b(void 0),w(void 0),f(u)},[u,i]),q=c=>{f(c.state),c.line_pos?b(c.line_pos):b(void 0)},v=o.exports.useCallback(c=>()=>{switch(c.outcome){case"no_objective":break;case"success":break;case"continue":break;default:alert(c.outcome);break}s()},[s]),G=o.exports.useCallback(async()=>{let c;try{c=await g.run_player_script(p.current(),"hello_world")}catch(l){if(l instanceof Q){console.warn(`Rhai Error detected: ${l.message}`),l.line?w({line:l.line,col:l.col,message:l.message}):alert(l.message);return}throw l}s(),f(c.states[0].state),x(!0);const _=new ne(c.states,q,v(c));H(_),_.start()},[s,v,g,p]),P=o.exports.useCallback(()=>{s()},[s]),W=o.exports.useCallback(()=>{i&&(i.pause(),m(!0))},[i]),J=o.exports.useCallback(()=>{i&&i.stepForward()},[i]),z=o.exports.useCallback(()=>{i&&i.stepBackward()},[i]),U=o.exports.useCallback(()=>{i&&(i.start(),m(!1))},[i]);return r(S,{width:"100%",direction:"row",mb:"50px",mt:"25px",children:[r(h,{flex:"1.0 1.0",children:[n(te,{isRunning:A,isPaused:N,runHandler:G,stopHandler:P,pauseHandler:W,stepForwardHandler:J,stepBackHandler:z,resumeHandler:U}),n(h,{children:n(re,{code:t.code,editable:!0,setGetCodeHandler:B,type:"example",activeLine:R,codeError:Y})})]}),n(h,{id:"fake-board",minH:"80px",width:410,p:4,ml:3,bg:"gray.300",border:"1px",borderColor:"gray.800",children:n(h,{position:"relative",children:n(oe,{offset:e,fuel:10,fuzzy:!1,message:I.players[0].message})})})]})}function C(t){const e=Object.assign({h3:"h3",p:"p",code:"code"},t.components);return r(a,{children:[n(e.h3,{children:"Functions"}),`
`,n(e.p,{children:`Functions are a fundamental building block of programming. They
let you organize code into smaller chunks that can be re-used
and combined in different ways. To use a function, you "call" it.`}),`
`,n(e.p,{children:`Functions can have inputs (also called "arguments") that affect
their behavior. Different functions may have different types of
inputs.`}),`
`,r(e.p,{children:["Here's an example of calling the ",n(e.code,{children:"say"}),` function with the
input `,n(e.code,{children:'"Hello, world!"'}),":"]}),`
`,n(d,{code:`say("Hello, world!");
`}),`
`,r(e.p,{children:["Here's an example of calling the ",n(e.code,{children:"move_right"}),` function with
the input `,n(e.code,{children:"5"}),":"]}),`
`,n(d,{code:`move_right(5);
`})]})}function ce(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(C,t)})):C(t)}function k(t){const e=Object.assign({h3:"h3",p:"p",code:"code",em:"em",strong:"strong"},t.components);return r(a,{children:[n(e.h3,{children:"Function Outputs"}),`
`,n(e.p,{children:`Some functions may have an output, also called a "return value". If a
function has an output, it just means that it spits out a value whenever
it is called. The output of a function can be used the same way as
any other value.`}),`
`,r(e.p,{children:["For example, the ",n(e.code,{children:"random"}),` function outputs a random number between 1 and 100.
We can use the output of the `,n(e.code,{children:"random"}),` function in the same way as any
other number. Below, we use it as the `,n(e.em,{children:"input"})," to the ",n(e.code,{children:"say"}),` function. This
will cause the rover to say a random number.`]}),`
`,n(d,{code:`say(random());
`}),`
`,r(e.p,{children:["\u2139\uFE0F ",n(e.strong,{children:"Tip:"}),` When a function does not have any inputs, you still need to include the
parentheses (just don't put anything inside them).`]}),`
`,r(e.p,{children:["\u2139\uFE0F ",n(e.strong,{children:"Tip:"})," Not all functions have an output. For example, the ",n(e.code,{children:"move_right"}),` function
does not output anything.`]})]})}function ae(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(k,t)})):k(t)}function M(t){const e=Object.assign({h3:"h3",p:"p",code:"code"},t.components);return r(a,{children:[n(e.h3,{children:"Comments"}),`
`,r(e.p,{children:["Every line that starts with two slashes ",n(e.code,{children:"//"}),` is called a
"comment". Comments don't affect the rover at all; they are
just little notes to help you understand the code. Feel free
to add your own comments too!`]}),`
`,n(e.p,{children:"Here's an example of a basic comment:"}),`
`,n(d,{code:`// This is a comment.
// You can have any number of comments in your code.
`}),`
`,`
`,r(e.p,{children:["In this next example, the ",n(e.code,{children:"say"}),` function is part of a comment. That means
the code in that line will not run and the rover will not say anything:`]}),`
`,n(d,{code:'// say("hello");'}),`
`,r(e.p,{children:["Try removing the two slashes before the ",n(e.code,{children:"say"}),` function above and
see what happens.`]})]})}function le(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(M,t)})):M(t)}function j(t){const e=Object.assign({h3:"h3",p:"p",code:"code"},t.components);return r(a,{children:[n(e.h3,{children:"Expressions"}),`
`,r(e.p,{children:[`"Expressions" are pieces of code that result in some value. There
are many different kinds of expressions, for example a "literal
expression" like the number `,n(e.code,{children:"42"})," or a math expression like ",n(e.code,{children:"2 + 3"}),"."]}),`
`,r(e.p,{children:[`Expressions can even contain other expressions! For example a math
expression like `,n(e.code,{children:"2 + 3"}),` technically contains two expressions (the
number `,n(e.code,{children:"2"})," and the number ",n(e.code,{children:"3"}),") joined by the ",n(e.code,{children:"+"}),` operator. The result
of the expression `,n(e.code,{children:"2 + 3"})," is the number ",n(e.code,{children:"5"}),"."]})]})}function de(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(j,t)})):j(t)}function O(t){const e=Object.assign({h3:"h3",p:"p",code:"code",h4:"h4",pre:"pre"},t.components);return r(a,{children:[n(e.h3,{children:"While Loops"}),`
`,r(e.p,{children:[`A while loop allows you to perform repeated actions. Everything inside the curly
braces (`,n(e.code,{children:"{"})," and ",n(e.code,{children:"}"}),`) will be repeated as long as the "condition" is true. The
"condition" is a boolean expression (i.e., an expression that evaluates to
`,n(e.code,{children:"true"})," or ",n(e.code,{children:"false"}),")."]}),`
`,n(e.p,{children:"\u26A0\uFE0F Elara has safeguards in place to prevent infinite loops."}),`
`,n(e.h4,{children:"Examples"}),`
`,r(e.p,{children:[`This while loop will run forever (or at least until the end of the level)
because the condition is always `,n(e.code,{children:"true"}),":"]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`while true {
    move_down(1);
}
`})}),`
`,r(e.p,{children:["This while loop uses the condition ",n(e.code,{children:"x < 5"}),`, so that means it will run as long
as the variable `,n(e.code,{children:"x"})," is less than 5. Since we increase the value of ",n(e.code,{children:"x"}),` on each
iteration of the loop, the loop will run 5 times:`]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let x = 0;

while x < 5 {
    x = x + 1;
    say(x);
}
`})})]})}function se(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(O,t)})):O(t)}function E(t){const e=Object.assign({h3:"h3",p:"p",code:"code",strong:"strong"},t.components);return r(a,{children:[n(e.h3,{children:"Variables"}),`
`,n(e.p,{children:`You can think of variables as "containers" that you can put values into and then
reference later. Almost anything can be stored in a variable, and you can use
the variable in other places in your code.`}),`
`,r(e.p,{children:["To create a new variable, use the ",n(e.code,{children:"let"}),` keyword. In the example below, we
assign the value `,n(e.code,{children:'"hello"'})," to a variable called ",n(e.code,{children:"greeting"}),`. Then we use
`,n(e.code,{children:"greeting"})," as the input to the ",n(e.code,{children:"say"})," function."]}),`
`,n(d,{code:`// Create a new variable named "greeting" with a value of "hello".
let greeting = "hello";

// Use the variable "greeting" as the input to the "say" function.
say(greeting);
`}),`
`,r(e.p,{children:[`After a variable is created, you can change the value it holds by using the
`,n(e.code,{children:"="})," operator again."]}),`
`,r(e.p,{children:["\u2139\uFE0F ",n(e.strong,{children:"Tip:"})," You don't need to use the ",n(e.code,{children:"let"}),` keyword when changing the
value of an existing variable.`]}),`
`,n(d,{code:`// First create a new variable named "number" with a value of 5.
let number = 5;
say(number);

// Now change the value of "number" to 10.
number = 10;
say(number);
`}),`
`,r(e.p,{children:[`If a function has an output, you can assign the output to a variable. Here's
an example of assigning the output of the `,n(e.code,{children:"random"}),` function to a variable called
`,n(e.code,{children:"random_number"}),"."]}),`
`,n(d,{code:`let random_number = random();
say(random_number);
`}),`
`,r(e.p,{children:["\u2139\uFE0F ",n(e.strong,{children:"Tip:"}),` If you are ever unsure about the value a variable holds, you can use
the `,n(e.code,{children:"say"})," function to have the rover say the value for you."]})]})}function he(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(E,t)})):E(t)}function D(t){const e=Object.assign({h3:"h3",p:"p",code:"code",h4:"h4",table:"table",thead:"thead",tr:"tr",th:"th",tbody:"tbody",td:"td"},t.components);return r(a,{children:[n(e.h3,{children:"Literals"}),`
`,r(e.p,{children:[`"Literals" are the simplest kind of expression. A literal is just
a value that appears directly in your code. Literals always have a
specific type. For example, `,n(e.code,{children:"42"}),` is a literal number, and
`,n(e.code,{children:'"Hello, world!"'})," is a literal string."]}),`
`,n(e.h4,{children:"Types of Literals"}),`
`,n(e.p,{children:`This table lists the different kinds of literals that you can expect
to use in Elara:`}),`
`,r(e.table,{children:[n(e.thead,{children:r(e.tr,{children:[n(e.th,{children:"Type"}),n(e.th,{children:"Description"}),n(e.th,{children:"Example"})]})}),r(e.tbody,{children:[r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"i64"})}),n(e.td,{children:'A number or "integer", i.e. a whole number that can be either positive or negative'}),n(e.td,{children:n(e.code,{children:"123"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"string"})}),n(e.td,{children:"A sequence of characters, i.e. text"}),n(e.td,{children:n(e.code,{children:'"Hello, world!"'})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"bool"})}),r(e.td,{children:["A boolean value, i.e. either ",n(e.code,{children:"true"})," or ",n(e.code,{children:"false"})]}),n(e.td,{children:n(e.code,{children:"true"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"array"})}),n(e.td,{children:"A list of values"}),n(e.td,{children:n(e.code,{children:"[1, 2, 3]"})})]})]})]}),`
`,n(e.p,{children:"You'll learn more about arrays later!"})]})}function ue(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(D,t)})):D(t)}function T(t){const e=Object.assign({h3:"h3",p:"p",code:"code",strong:"strong",em:"em",h4:"h4",pre:"pre"},t.components);return r(a,{children:[n(e.h3,{children:"Arrays"}),`
`,n(e.p,{children:`An array is a list of values. The values can be of any type, and they
are not necessarily all of the same type. The values inside an array
are sometimes called "elements".`}),`
`,r(e.p,{children:[`You can access the elements of an array by providing an "index" in
between square brackets (`,n(e.code,{children:"["})," and ",n(e.code,{children:"]"}),`). See below for some examples. Note
that the first element of the array has index `,n(e.code,{children:"0"}),", ",n(e.strong,{children:n(e.em,{children:"not"})})," ",n(e.code,{children:"1"}),"."]}),`
`,r(e.p,{children:["You can also use the ",n(e.code,{children:"len"}),` function on an array to determine its length,
i.e., how many elements it contains.`]}),`
`,n(e.h4,{children:"Examples"}),`
`,n(e.p,{children:"Declaring an array and assigning it to a variable:"}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let arr = [1, 2, 3];
`})}),`
`,n(e.p,{children:"Accessing the first element of an array:"}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let arr = [1, 2, 3];
say(arr[0]);
`})}),`
`,n(e.p,{children:"Getting the next element of an array (i.e., the element at index 1):"}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let arr = [1, 2, 3];
say(arr[1]);
`})}),`
`,r(e.p,{children:["Using the ",n(e.code,{children:"len"})," function to determine the length of an array:"]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let arr = [1, 2, 3];
say(len(arr));
`})})]})}function pe(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(T,t)})):T(t)}function L(t){const e=Object.assign({h3:"h3",p:"p",code:"code",pre:"pre",h4:"h4",table:"table",thead:"thead",tr:"tr",th:"th",tbody:"tbody",td:"td"},t.components);return r(a,{children:[n(e.h3,{children:"Math Expressions"}),`
`,r(e.p,{children:[`A math expression uses numbers and a mathematical operator
(e.g. `,n(e.code,{children:"+"})," or ",n(e.code,{children:"-"}),`) to produce a new number. You may already be
familiar with math expressions from your math class.`]}),`
`,r(e.p,{children:[`Since math expressions result in a number, they can be used
in your code anywhere a number can be used. For example, you
can use a math expression in the `,n(e.code,{children:"move_right"})," function:"]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`move_right(1 + 2);
`})}),`
`,r(e.p,{children:["Since ",n(e.code,{children:"1 + 2"})," results in ",n(e.code,{children:"3"}),`, the above code will cause the
rover to move right 3 spaces.`]}),`
`,n(e.h4,{children:"Math Operators"}),`
`,n(e.p,{children:`There are a few different kinds of operators that can be used in
math expressions.`}),`
`,r(e.table,{children:[n(e.thead,{children:r(e.tr,{children:[n(e.th,{children:"Operator"}),n(e.th,{children:"Description"}),n(e.th,{children:"Example"})]})}),r(e.tbody,{children:[r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"+"})}),n(e.td,{children:"Addition"}),n(e.td,{children:n(e.code,{children:"1 + 2"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"-"})}),n(e.td,{children:"Subtraction"}),n(e.td,{children:n(e.code,{children:"3 - 4"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"*"})}),n(e.td,{children:"Multiplication"}),n(e.td,{children:n(e.code,{children:"5 * 6"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"/"})}),n(e.td,{children:"Division"}),n(e.td,{children:n(e.code,{children:"7 / 8"})})]})]})]}),`
`,n(e.h4,{children:"Order of Operations"}),`
`,r(e.p,{children:[`Math expressions follow the same order of operations you're
probably used to. For example, multiplication and division
are done before addition or subtraction. For example, `,n(e.code,{children:"2 + 3 * 4"}),`
results in `,n(e.code,{children:"14"})," because ",n(e.code,{children:"3 * 4"})," is done first, then ",n(e.code,{children:"2 + 14"}),"."]}),`
`,r(e.p,{children:[`As you might expect, you can use parentheses to change the order
of operations. For example, `,n(e.code,{children:"(2 + 3) * 4"})," results in ",n(e.code,{children:"20"}),` because
`,n(e.code,{children:"2 + 3"})," is done first, then ",n(e.code,{children:"20 * 4"}),"."]})]})}function me(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(L,t)})):L(t)}function $(t){const e=Object.assign({h3:"h3",p:"p",code:"code",ol:"ol",li:"li",h4:"h4",table:"table",thead:"thead",tr:"tr",th:"th",tbody:"tbody",td:"td"},t.components);return r(a,{children:[n(e.h3,{children:"Comparisons"}),`
`,r(e.p,{children:[`A "comparison expression" can be used to compare two different values.
For example, the comparison expression `,n(e.code,{children:"1 < 2"})," results in ",n(e.code,{children:"true"}),`, because
1 is less than 2. The comparison expression `,n(e.code,{children:"1 > 2"})," results in ",n(e.code,{children:"false"}),"."]}),`
`,n(e.p,{children:"Comparison expressions are similar to math expressions, but:"}),`
`,r(e.ol,{children:[`
`,r(e.li,{children:["Instead of using a math operator like ",n(e.code,{children:"+"})," or ",n(e.code,{children:"-"}),", they use a comparison operator like ",n(e.code,{children:"<"})," or ",n(e.code,{children:">"}),"."]}),`
`,r(e.li,{children:["Instead of resulting in a number, they result in a boolean value (",n(e.code,{children:"true"})," or ",n(e.code,{children:"false"}),")."]}),`
`]}),`
`,n(e.h4,{children:"Comparison Operators"}),`
`,n(e.p,{children:"Here is the full list of comparison operators and what they mean:"}),`
`,r(e.table,{children:[n(e.thead,{children:r(e.tr,{children:[n(e.th,{children:"Operator"}),n(e.th,{children:"Description"}),n(e.th,{children:"Example"})]})}),r(e.tbody,{children:[r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"<"})}),n(e.td,{children:"Less than"}),n(e.td,{children:n(e.code,{children:"1 < 2"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"<="})}),n(e.td,{children:"Less than or equal"}),n(e.td,{children:n(e.code,{children:"2 <= 3"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:">"})}),n(e.td,{children:"Greater than"}),n(e.td,{children:n(e.code,{children:"3 > 4"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:">="})}),n(e.td,{children:"Greater than or equal"}),n(e.td,{children:n(e.code,{children:"5 >= 6"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"=="})}),n(e.td,{children:"Equal"}),n(e.td,{children:n(e.code,{children:"7 == 8"})})]}),r(e.tr,{children:[n(e.td,{children:n(e.code,{children:"!="})}),n(e.td,{children:"Not equal"}),n(e.td,{children:n(e.code,{children:"9 != 10"})})]})]})]})]})}function fe(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n($,t)})):$(t)}function X(t){const e=Object.assign({h3:"h3",p:"p",code:"code",em:"em",h4:"h4",pre:"pre"},t.components);return r(a,{children:[n(e.h3,{children:"If Statements"}),`
`,n(e.p,{children:`An if statement allows you to run a block of code if some condition is true.
You can use an if statement to perform different actions based on different
conditions.`}),`
`,r(e.p,{children:["You begin an if statement with the ",n(e.code,{children:"if"}),` keyword. Everything inside the curly
brackets `,n(e.code,{children:"{"})," and ",n(e.code,{children:"}"}),` will be run if the condition is true. You can also optionally
extend an `,n(e.code,{children:"if"})," statement by adding the ",n(e.code,{children:"else"})," keyword. The code following the ",n(e.code,{children:"else"}),`
keyword will be run if the condition is `,n(e.em,{children:"false"}),"."]}),`
`,r(e.p,{children:["There is one more version of the ",n(e.code,{children:"if"})," statement, which includes the ",n(e.code,{children:"else if"}),` keyword.
This allows you to check multiple different conditions in a single statement. When using
`,n(e.code,{children:"else if"}),`, the conditions are checked in order. If the first condition is false, then
the second condition is checked, and so on. An optional `,n(e.code,{children:"else"}),` statement at the end
will be run if none of the other conditions are true.`]}),`
`,n(e.p,{children:`Just like a while loop, the conditions in an if statement are boolean
expressions.`}),`
`,n(e.h4,{children:"Examples"}),`
`,r(e.p,{children:["If the variable ",n(e.code,{children:"x"}),' is less than 10, say "x is less than 10":']}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let x = 5;
if x < 10 {
    say("x is less than 10");
}
`})}),`
`,r(e.p,{children:["If the variable ",n(e.code,{children:"x"}),` is less than 10, say "x is less than 10". Otherwise,
say "x is not less than 10".`]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let x = 12;
if x < 10 {
    say("x is less than 10");
} else {
    say("x is not less than 10");
}
`})}),`
`,r(e.p,{children:["If the variable ",n(e.code,{children:"x"})," is less than 5, move to the right. Otherwise, if ",n(e.code,{children:"x"}),` is less than
10, move to the left. Finally, if all other conditions are false, move down:`]}),`
`,n(e.pre,{children:n(e.code,{className:"language-rhai",children:`let x = 7;
if x < 5 {
    move_right(1);
} else if x < 10 {
    move_left(1);
} else {
    move_down(1);
}
`})})]})}function be(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(X,t)})):X(t)}function F(t){const e=Object.assign({h3:"h3",p:"p",code:"code",pre:"pre",strong:"strong"},t.components);return r(a,{children:[n(e.h3,{children:"Loops"}),`
`,r(e.p,{children:[`Loops are a way to repeat code over and over again. Everything
inside the curly braces (`,n(e.code,{children:"{"})," and ",n(e.code,{children:"}"}),`) will be repeated until you
reach the end of the level or run out of fuel.`]}),`
`,n(e.p,{children:`For example, this loop will cause the rover to move right 1 space,
then left 1 space, over and over again until it runs out of fuel.`}),`
`,n(e.pre,{children:n(e.code,{children:`loop {
    move_right(1);
    move_left(1);
}
`})}),`
`,r(e.p,{children:["\u26A0\uFE0F ",n(e.strong,{children:"Warning:"}),` Be careful! Elara has safeguards in place to prevent
infinite loops. If a possible infinite loop is detected, you will
see an error message.`]})]})}function ye(t={}){const{wrapper:e}=t.components||{};return e?n(e,Object.assign({},t,{children:n(F,t)})):F(t)}const y={comments:le,functions:ce,function_outputs:ae,expressions:de,literals:ue,math_expressions:me,loops:ye,comparisons:fe,variables:he,arrays:pe,while_loops:se,if_statements:be};function ge(t){const e=y[t.section];return n("div",{className:"md-content",children:n(e,{})})}function je(){let{sectionName:t}=Z();if(t||(t=Object.keys(y)[0]),t!==void 0&&!(t in y))throw new Error(`Unknown section: ${t}`);return o.exports.useEffect(()=>{t?document.title=`Elara | Journal: ${t}`:document.title="Elara | Journal"},[t]),n(h,{children:n(ie,{maxW:"container.xl",children:n(S,{direction:"row",children:n(h,{bg:"white",p:8,minH:"",children:n(ge,{section:t})})})})})}export{je as default};
