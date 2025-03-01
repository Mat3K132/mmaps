import { Client, IntentsBitField, Message } from 'discord.js';
import axios, { AxiosResponse, AxiosError } from 'axios'; // Add AxiosError

interface Env {
  DISCORD_TOKEN: string;
  X_API_TOKEN: string;
  HF_TOKEN?: string;
}

import 'dotenv/config';
const { DISCORD_TOKEN, X_API_TOKEN, HF_TOKEN } = process.env as unknown as Env;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

interface Tweet {
  id: string;
  text: string;
}

const filterContent = (text: string): boolean => {
  const badWords: string[] = ['spam', 'offensive', 'clickbait'];
  return !badWords.some((word) => text.toLowerCase().includes(word));
};

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'getcontent') {
    const topic = args.join(' ') || 'random';
    try {
      const response: AxiosResponse<{ data: Tweet[] }> = await axios.get(
        'https://api.twitter.com/2/tweets/search/recent',
        {
          headers: { Authorization: `Bearer ${X_API_TOKEN}` },
          params: { query: `${topic} -is:retweet`, max_results: 10 },
        }
      );

      const tweets = response.data.data;
      if (!tweets || tweets.length === 0) {
        return message.reply('No content found for this topic.');
      }

      const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
      if (filteredTweets.length === 0) return message.reply('No suitable content after filtering.');
      const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
      const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
      message.reply(`Content about "${topic}":\n> ${randomTweet.text}\n${tweetUrl}`);
    } catch (error) {
      const axiosError = error as AxiosError;
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
    if (!query) return message.reply('Please provide a query!');

    try {
      const response: AxiosResponse<{ data: Tweet[] }> = await axios.get(
        'https://api.twitter.com/2/tweets/search/recent',
        {
          headers: { Authorization: `Bearer ${X_API_TOKEN}` },
          params: { query: `${query} -is:retweet`, max_results: 10 },
        }
      );

      const tweets = response.data.data;
      if (!tweets || tweets.length === 0) {
        return message.reply('No content found for this query.');
      }

      const filteredTweets = tweets.filter((tweet) => filterContent(tweet.text));
      if (filteredTweets.length === 0) return message.reply('No suitable content after filtering.');
      const randomTweet = filteredTweets[Math.floor(Math.random() * filteredTweets.length)];
      const tweetUrl = `https://twitter.com/i/status/${randomTweet.id}`;
      message.reply(`Content for "${query}":\n> ${randomTweet.text}\n${tweetUrl}`);
    } catch (error) {
      const axiosError = error as AxiosError;
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

