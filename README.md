# defective-healer
This is the Telegram bot based on telegraf with quotes of Svyatoslav Victorovich.

## Files required for project
- `./.env`                  - contains bot Telegram authorization token and list of user ids.
- `./quotes.json.locked`    - contains all quotes from defective healing, ignored as huge and rude.
- `./sessions.json`         - contains all RESTful state of all private and common chats, created automatically if absent, behaves as local session storage.
- `./logs/dh-error.log`     - contains all logged winston errors.
- `./logs/dh-info.log`      - contains all logged winston info.
- `./logs/dh-warn.log`      - contains all logged winston warnings.

## Admin commands
- `/stats`  - open sessions, both private and chat ones,
  - private - shows _id_, _type_, _first_name_, and _last_name_
  - chat - shows _id_, _type_ and _chat_title_
  
## `.env` file variables
- `BOT_TOKEN` - telegram token of your bot
- `PEOPLE_TO_TROLL` - list of people to troll with private treat, format: `<id>[<some_random_name>]`
- `ADMINS` - list of admins who have the right to see hiddne stats of all active sessions and stats from all messages in logs, format: `<id>[<some_random_name>]`
- `SESSIONS_TO_IGNORE` - list of sessions to ignore some functionality, like regexp mentioning, format: `<id>[<some_random_name>]` 
- `CHATS_TO_TROLL` - list of chats where bot will randomly spam without hooks or calls, format: `<id>[<some_chat_name>]`

## Docker
### Build image
- go to the project root directory
- build docker image with `docker build -t kblnsk/defective-healer-bot .`. :exclamation: Be sure that `.env` file is present within the build environment.
- push to docker hub `docker-compose push`
### Run container
- `docker run -d kblnsk/defective-healer-bot` 

## Deploy to AWS
- Login `$(aws ecr get-login --no-include-email --region eu-central-1)`
- Build docker image for AWS `docker build -t defective-healer-bot:latest .`
- Tag AWS docker image `docker tag defective-healer-bot:latest 422803361886.dkr.ecr.eu-central-1.amazonaws.com/defective-healer-bot:latest`
- Docker push image to AWS `docker push 422803361886.dkr.ecr.eu-central-1.amazonaws.com/defective-healer-bot:latest`
