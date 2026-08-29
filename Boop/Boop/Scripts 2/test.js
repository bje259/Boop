/**
    {
        "api":1,
        "name":"Test",
        "description":"Search for a regex pattern in the text.",
        "author":"bje",
        "icon":"elephant",
        "tags":"regex,search"
    }
**/

function main(state) {
    try {
        state.text = `
        "X:\Downloads\Downloads\Kyonyuu_Elf_Oyako_saimin_-_ENG"
        "X:\Downloads\Downloads\nwjs-sdk-v0.61.0-win-x64"
        "X:\Downloads\Downloads\Princess_Trainer_203-win"
        "X:\Downloads\Downloads\Scars_of_Summer_v1.03"
        "X:\Downloads\Downloads\The_Coven-v0.9-pc"
        s/"X:\\\/mynas://
        `
        
    } catch (error) {
        state.postError("Something strange happened here...");
        state.text = state.text + "\n" + error.message;
    }
}
