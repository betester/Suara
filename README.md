## Development Guide

### 1. Create a .env file

The file has to follow the .env.example key, you can get the token and client id from https://discord.com/developers/

### 2. Run docker compose

Since the projects uses mongo, it's much more easier if you use docker compose. Run `docker compose -f compose.dev.yml up`, it will automatically set up the required environment.
