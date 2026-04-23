require("dotenv").config();
(async () => {
    try {
        let url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY;
        let allModels = [];
        let data = await (await fetch(url)).json();
        allModels = allModels.concat(data.models);
        while(data.nextPageToken) {
           data = await (await fetch(url + "&pageToken=" + data.nextPageToken)).json();
           allModels = allModels.concat(data.models);
        }
        allModels.filter(m => m.supportedGenerationMethods.includes("generateContent")).forEach(m => console.log(m.name));
    } catch(e) {}
})();
