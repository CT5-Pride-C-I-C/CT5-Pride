require('dotenv').config();

module.exports = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY, // Actually service role key in your setup
  EVENTBRITE_PRIVATE_TOKEN: process.env.EVENTBRITE_PRIVATE_TOKEN,
  EVENTBRITE_PUBLIC_TOKEN: process.env.EVENTBRITE_PUBLIC_TOKEN,
  EVENTBRITE_CLIENT_SECRET: process.env.EVENTBRITE_CLIENT_SECRET,
  EVENTBRITE_API_KEY: process.env.EVENTBRITE_API_KEY, // Added missing API key
  GITHUB_TOKEN: process.env.GITHUB_TOKEN, // Added GitHub token
}; 