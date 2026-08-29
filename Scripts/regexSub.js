/**
	{
		"api":1,
		"name":"Regex Substitution",
		"description":"Search for a regex pattern in the text, then replace it.",
		"author":"bje",
		"icon":"elephant",
		"tags":"regex,search,substitution"
	}
**/



function mainold(state) {
  try {
    let text = state.text;
    // text += "\n" + text.split("\n")[text.split("\n").length - 1];
    // s<delim><pat><delim><rep><delim><flags>
    // pat must be non-empty (+), rep can be empty (*)
    const rule = /^s(?<d>[^A-Za-z0-9\s])(?<pat>(?:\\.|(?!\k<d>).)+)\k<d>(?<rep>(?:\\.|(?!\k<d>).)*)\k<d>(?<flags>[a-z]*)/i;
    const m = rule.exec(text);
    if (!m) { state.postError("No substitution regex pattern found."); return; }

    let { pat, rep, flags } = m.groups;
    // text += `\n${rep}`;
    // Strip the rule + trailing whitespace/newline
    const clean = text.slice(m[0].length).replace(/^[ \t]*\r?\n?/, "");

    // Optional: interpret simple escapes in replacement (\n, \r, \t, \\ and \$ → literal $)
    rep = rep
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\\$/g, "$");

    // Build regex (validate flags if you want)
    const rx = new RegExp(pat, flags || undefined);

    state.text = clean.replace(rx, rep);
  } catch (err) {
    state.postError("Something strange happened here...");
    state.text += "\n" + err.message;
  }
}


function main(state) {
  try {
    const lines = state.text.split(/\r?\n/);

    const ruleRegex =
      /^s(?<d>[^A-Za-z0-9\s])(?<pat>(?:\\.|(?!\k<d>).)+)\k<d>(?<rep>(?:\\.|(?!\k<d>).)*)\k<d>(?<flags>[a-z]*)$/i;

    const defRegex =
      /^def\s+(?<id>[A-Za-z][A-Za-z0-9_]*)\s*(?<d>[^A-Za-z0-9\s])(?<val>(?:\\.|(?!\k<d>).)*)\k<d>$/;

    const definitions = {};
    const substitutions = [];

    let firstNonRuleLineIndex = lines.length;

    // --- Parse definitions and rules ---
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // --- NEW: skip blank lines while parsing rules/defs
      if (line === "") {
        continue;
      }
      const defMatch = defRegex.exec(line);
      if (defMatch) {
        const { id, val } = defMatch.groups;
        definitions[id] = val;
        continue;
      }

      const ruleMatch = ruleRegex.exec(line);
      if (ruleMatch) {
        let { d, pat, rep, flags } = ruleMatch.groups;

        pat = expand(pat, definitions);
        rep = expand(rep, definitions);
        flags = expand(flags, definitions);

        rep = rep
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\")
          .replace(/\\\$/g, "$");

        substitutions.push({
          rx: new RegExp(pat, flags || undefined),
          rep
        });

        continue;
      }

      // First non-rule, non-def line → body begins
      firstNonRuleLineIndex = i;
      break;
    }

    // --- The body of text to transform ---
    const textBody = lines.slice(firstNonRuleLineIndex).join("\n");

    // --- Apply substitutions ---
    let result = textBody;
    for (const { rx, rep } of substitutions) {
      result = result.replace(rx, rep);
    }

    state.text = result;
  } catch (err) {
    state.postError("Regex substitution failed.");
    state.text += "\n" + err.message;
  }
}

// Macro expander (simple literal replace)
function expand(str, defs) {
  for (const id in defs) {
    str = str.replaceAll(id, defs[id]);
  }
  return str;
}




// function main(state) {
//     try {
//         let text = state.text;
//         // Updated regex with negative lookbehind for '/'
//         let regexParse = /(?<=s\/)(.*?)(?<!\\)\/(.*?)(?<!\\)\/(.*?)(?=\s|\n|$)/;
//         state.text = state.text + "\n" + regexParse.flags;
//         let patternMatch = regexParse.exec(text);
        
//         console.log("patternMatch:", patternMatch);
//         if (patternMatch === null) {
//             state.postError("No substitution regex pattern found.");
//             return;
//         }
        
//         let pattern = patternMatch[1];
//         let replacement = patternMatch[2];
//         console.log("patternMatch[3]:", patternMatch[3]);
//         let flags = patternMatch[3];
//         let cleanText = text.replace(/s\/.*?\/.*?\/.*?(?=\s|\n|$)/, "");
//         let regex = new RegExp(pattern, flags);
//         let newText = cleanText.replace(regex, replacement);
        
//         state.text = newText;
//     } catch (error) {
//         state.postError("Something strange happened here...");
//         state.text = state.text + "\n" + error.message;
//     }
// }

// function main(state) {
//     try {
//         let text = state.text;
//         let regexParse = /(?<=s\/)(.*?)\/(.*?)\/(.*?)(?=\s|\n|$)/;
//         let patternMatch = regexParse.exec(text);
//         console.log("patternMatch:", patternMatch);
//         if (patternMatch === null) {
//             state.postError("No substiution regex pattern found.");
//             return;
//         }
//
//         let pattern = patternMatch[1];
//         let replacement = patternMatch[2];
//         console.log("patternMatch[3]:", patternMatch[3]);
//         let flags = patternMatch[3];
//         let cleanText = text.replace(/s\/.*?\/.*?\/.*?(?=\s|\n|$)/, "");
//         let regex = new RegExp(pattern, flags);
//         let newText = cleanText.replace(regex, replacement);
//
//         state.text = newText;
//     } catch (error) {
//         state.postError("Something strange happened here...");
//         state.text = state.text + "\n" + error.message;
//     }
// }