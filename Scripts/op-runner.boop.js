/**
  {
    "api":1,
    "name":"Ops Runner",
    "description":"Run op <name> with args, or show help.",
    "author":"you",
    "icon":"wand",
    "tags":"ops,regex,sequence,help"
  }
**/
function main(state) {
    try {  
    const {run} = require('lib/opcore');
    run(state);
    }
  catch (e) { 
    state.fullText = state.fullText + "\n\n" + e.message + "\n" + e.stack;
    state.postError(e.message); 
    }
}