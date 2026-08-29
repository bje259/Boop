/**
	{
		"api":1,
		"name":"Regex Search",
		"description":"Search for a regex pattern in the text.",
		"author":"bje",
		"icon":"elephant",
		"tags":"regex,search"
	}
**/

function main(state) {
    try {
        let results = [];
        let text = state.text;
        let regexParse = /(?<=r\/)(.*?)\/(.*?)(?=\s|\n|$)/;
        let patternMatch = regexParse.exec(text);

        if (patternMatch === null) {
            state.postError("No regex pattern found.");
            return;
        }

        let pattern = patternMatch[1];
        let flags = patternMatch[2];
        let cleanText = text.replace(/r\/.*?\/.*?(?=\s|\n|$)/, "");
        let regex = new RegExp(pattern, flags);
        let match = regex.exec(cleanText);
        let matchCount = 0;

        do {
            if (!match) {
                results.push("No matches found.");
                break;
            }

            matchCount++;
            results.push(`Full match: ${match[0]}\n`);
            match.shift();

            if (match.length > 0) {
                let grpCnt = 0;
                for (let captureGrp of match) {
                    grpCnt++;
                    results.push(`Capture group ${grpCnt}: ${captureGrp}\n`);
                }
            }

            match = regex.exec(cleanText);
        } while (match && regex.global && matchCount < 10);

        state.text = state.text + "\n" + results.join("");
    } catch (error) {
        state.postError("Something strange happened here...");
        state.text = state.text + "\n" + error.message;
    }
}
