const required = ['DATABASE_URL', 'PORT'];

const missing = required.filter(key => !process.env[key]);

if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

module.exports = {
    DATABASE_URL:   process.env.DATABASE_URL,
    PORT:           Number(process.env.PORT)
};