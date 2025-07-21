require('dotenv').config();

module.exports = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_KEY: process.env.SUPABASE_KEY, // Service role key for backend operations
  EVENTBRITE_PRIVATE_TOKEN: process.env.EVENTBRITE_PRIVATE_TOKEN,
  EVENTBRITE_PUBLIC_TOKEN: process.env.EVENTBRITE_PUBLIC_TOKEN,
  EVENTBRITE_CLIENT_SECRET: process.env.EVENTBRITE_CLIENT_SECRET,
}; 