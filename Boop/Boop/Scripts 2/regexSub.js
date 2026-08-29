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

function main(state) {
    try {
        let text = state.text;
        // Updated regex with negative lookbehind for '/'
        let regexParse = /(?<=s\/)(.*?)(?<!\\)\/(.*?)(?<!\\)\/(.*?)(?=\s|\n|$)/;
        state.text = state.text + "\n" + regexParse.flags;
        let patternMatch = regexParse.exec(text);

        console.log("patternMatch:", patternMatch);
        if (patternMatch === null) {
            state.postError("No substitution regex pattern found.");
            return;
        }

        let pattern = patternMatch[1];
        let replacement = patternMatch[2];
        console.log("patternMatch[3]:", patternMatch[3]);
        let flags = patternMatch[3];
        let cleanText = text.replace(/s\/.*?\/.*?\/.*?(?=\s|\n|$)/, "");
        let regex = new RegExp(pattern, flags);
        let newText = cleanText.replace(regex, replacement);

        state.text = newText;
    } catch (error) {
        state.postError("Something strange happened here...");
        state.text = state.text + "\n" + error.message;
    }
}
