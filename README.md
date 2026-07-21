# MindMate

MindMate is an AI chat companion for mental wellness support, built around a team of 8 specialized agents instead of a single general-purpose chatbot. Each agent handles a narrow slice of the conversation — grounding, reframing, sleep, habits, journaling, crisis response, etc. — and a routing layer decides which one responds, so the person on the other end just sees one steady conversation.

This started as a capstone-adjacent side project to explore multi-agent orchestration with n8n, paired with a from-scratch frontend.

## Why

Most AI wellness chatbots are one model trying to do everything — coach, therapist, journal, alarm clock. MindMate splits that up on purpose. A message about racing thoughts at 2am doesn't need the same "personality" as a message about sticking to a morning walk streak. Routing to a narrower agent per message type keeps responses more consistent and easier to reason about (and debug) than one giant prompt trying to cover every case.

## How it works

- Every incoming message hits a single n8n **Chat Trigger** webhook.
- A routing step reads the message and decides which of the 8 agents should handle it.
- A **crisis triage** check runs on every message regardless of routing outcome — if it flags, the response path changes before anything else happens.
- Agent output passes through a merge/safety validation step before it's sent back to the frontend.
- The frontend is two static pages (`index.html`, `chat.html`) that talk to the webhook directly over `fetch` — no widget library, so styling isn't fighting a third-party shadow DOM.

```
User message → Chat Trigger (n8n) → Crisis check → Router → Agent → Safety validator → Response
```

## Tech stack

- **Backend / orchestration:** n8n (self-hosted via Docker)
- **Frontend:** HTML, CSS, vanilla JS — no framework
- **Tunneling (dev):** Cloudflare Tunnel
- **Hosting (target):** TBD — evaluating Render vs. Fly.io for a permanent free-tier deployment

## Project structure

```
mindmate/
├── index.html          # landing page
├── chat.html            # chat interface
├── css/
│   ├── base.css         # shared variables, nav, breathing animation
│   ├── home.css          # landing page styles
│   └── chat.css          # chat page styles
├── js/
│   ├── home.js           # nav scroll state + scroll-reveal
│   └── chat.js            # webhook calls, message rendering
└── n8n/
    └── mindmate-workflow.json   # exported n8n workflow (agents, routing, crisis triage)
```

## Running it locally

1. **Start n8n**
   ```bash
   docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
   ```
2. Import `n8n/mindmate-workflow.json` into n8n and activate the workflow.
3. Copy the **production** webhook URL from the Chat Trigger node.
4. If testing from another device, expose n8n with a tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:5678
   ```
5. In `js/chat.js`, set:
   ```js
   const WEBHOOK_URL = 'your-webhook-url-here';
   ```
6. Open `index.html` in a browser (or serve the folder with any static server).

Note: on the Chat Trigger node, make sure **Allowed Origins (CORS)** includes whatever domain you're serving the frontend from, or requests will silently fail.

## Status

- Core workflow (8 agents, routing, crisis triage, safety validation): working, tested with ad hoc messages
- Frontend: landing + chat pages done
- Permanent deployment: not finished yet — currently only reachable via a temporary Cloudflare tunnel
- Structured test suite: in progress

## Roadmap

- [ ] Move off the temporary tunnel to a permanent host
- [ ] Run a full structured test pass across all 8 agents and edge cases
- [ ] Write up the concept note
- [ ] Add real screenshots once there's a stable deployed link

## Disclaimer

MindMate is a student project, not a clinical tool. It is not a substitute for professional mental health care. If you or someone you know is in crisis, please contact a local emergency service or a crisis line directly.

## Author

Ibrahim Ahmad
B.Tech, Industrial IoT — GGSIPU

## License

MIT
