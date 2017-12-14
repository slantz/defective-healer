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
