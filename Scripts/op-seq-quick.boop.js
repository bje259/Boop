/**
  {
    "api":1,
    "name":"Seq Quick (1..10)",
    "description":"Preset: generate 1..10",
    "author":"you",
    "icon":"broom",
    "tags":"sequence,preset"
  }
**/
function main(state) {
  const { run } = require('lib/opcore');
  try {
    const preset = {
      name: 'seq',
      args: ['1','10','1'],
      opts: { delim: ', ' }   // tweak defaults here
    };
    run(state, preset);
  } catch (e) {
    state.postError(e.message);
  }
}