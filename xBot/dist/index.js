"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
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
client.once('ready', () => {
    console.log('Bot is ready!');
});
client.on('messageCreate', async (message) => {
    if (message.author.bot)
        return;
    const prefix = '!';
    if (!message.content.startsWith(prefix))
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (command === 'getcontent') {
        const topic = args.join(' ') || 'random';
        try {
            const response = await axios_1.default.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: { Authorization: `Bearer ${X_API_TOKEN}` },
                params: { query: `${topic} -is:retweet`, max_results: 10 },
            });
            const tweets = response.data.data;
            if (!tweets || tweets.length === 0) {
                return message.reply('No content found for this topic.');
            }
            const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
            if (filteredTweets.length === 0)
                return message.reply('No suitable content after filtering.');
            const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
            const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
            message.reply(`Content about "${topic}":\n> ${randomTweet.text}\n${tweetUrl}`);
        }
        catch (error) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 429) {
                const resetTime = axiosError.response.headers['x-rate-limit-reset'];
                const resetDate = resetTime ? new Date(Number(resetTime) * 1000).toLocaleString() : 'unknown';
                return message.reply(`Rate limit exceeded. Try again after ${resetDate}.`);
            }
            console.error(error);
            message.reply('Error fetching content from X.');
        }
    }
    if (command === 'customquery') {
        const query = args.join(' ');
        if (!query)
            return message.reply('Please provide a query!');
        try {
            const response = await axios_1.default.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: { Authorization: `Bearer ${X_API_TOKEN}` },
                params: { query: `${query} -is:retweet`, max_results: 10 },
            });
            const tweets = response.data.data;
            if (!tweets || tweets.length === 0) {
                return message.reply('No content found for this query.');
            }
            const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
            if (filteredTweets.length === 0)
                return message.reply('No suitable content after filtering.');
            const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
            const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
            message.reply(`Content for "${query}":\n> ${randomTweet.text}\n${tweetUrl}`);
        }
        catch (error) {
            const axiosError = error;
            if (axiosError.response && axiosError.response.status === 429) {
                const resetTime = axiosError.response.headers['x-rate-limit-reset'];
                const resetDate = resetTime ? new Date(Number(resetTime) * 1000).toLocaleString() : 'unknown';
                return message.reply(`Rate limit exceeded. Try again after ${resetDate}.`);
            }
            console.error(error);
            message.reply('Error fetching content from X.');
        }
    }
});
client.login(DISCORD_TOKEN);
