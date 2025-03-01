"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const { DISCORD_TOKEN, X_API_TOKEN, HF_TOKEN } = process.env;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
    ],
});
const filterContent = (text) => {
    const badWords = ['spam', 'offensive', 'clickbait'];
    return !badWords.some((word) => text.toLowerCase().includes(word));
};
// Optional AI filter (uncomment to use)
/*
const filterContentAdvanced = async (text: string): Promise<boolean> => {
  const response: AxiosResponse<{ label: string; score: number }[][]> = await axios.post(
    'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
    { inputs: text },
    { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
  );
  const sentiment = response.data[0][0].label === 'POSITIVE';
  return sentiment && filterContent(text);
};
*/
client.once('ready', () => {
    console.log('Bot is ready!');
});
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (message.author.bot)
        return;
    const prefix = '!';
    if (!message.content.startsWith(prefix))
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (command === 'getcontent') {
        const topic = args.join(' ') || 'random';
        try {
            const response = yield axios_1.default.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: { Authorization: `Bearer ${X_API_TOKEN}` },
                params: { query: `${topic} -filter:retweets`, max_results: 10 },
            });
            const tweets = response.data.data;
            if (!tweets || tweets.length === 0) {
                return message.reply('No content found for this topic.');
            }
            const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
            // Swap with filterContentAdvanced for AI filtering
            // const filteredTweets = await Promise.all(tweets.map(async (tweet) => (await filterContentAdvanced(tweet.text)) ? tweet : null)).then(results => results.filter(Boolean));
            if (filteredTweets.length === 0)
                return message.reply('No suitable content after filtering.');
            const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
            const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
            message.reply(`Content about "${topic}":\n> ${randomTweet.text}\n${tweetUrl}`);
        }
        catch (error) {
            console.error(error);
            message.reply('Error fetching content from X.');
        }
    }
    if (command === 'customquery') {
        const query = args.join(' ');
        if (!query)
            return message.reply('Please provide a query!');
        try {
            const response = yield axios_1.default.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: { Authorization: `Bearer ${X_API_TOKEN}` },
                params: { query: `${query} -filter:retweets`, max_results: 10 },
            });
            const tweets = response.data.data;
            if (!tweets || tweets.length === 0) {
                return message.reply('No content found for this query.');
            }
            const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
            // Swap with filterContentAdvanced for AI filtering
            // const filteredTweets = await Promise.all(tweets.map(async (tweet) => (await filterContentAdvanced(tweet.text)) ? tweet : null)).then(results => results.filter(Boolean));
            if (filteredTweets.length === 0)
                return message.reply('No suitable content after filtering.');
            const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
            const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
            message.reply(`Content for "${query}":\n> ${randomTweet.text}\n${tweetUrl}`);
        }
        catch (error) {
            console.error(error);
            message.reply('Error fetching content from X.');
        }
    }
}));
client.login(DISCORD_TOKEN);
