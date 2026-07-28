every job in queue stored in redis server. So that firstly, we should provide redis connection details. Host, Port and Password as mentioned in the file Backend/Src/queues/queue.config.ts.

BullMQ
   │
   ▼
Needs Redis
   │
   ▼
Needs a network connection
   │
   ├── Host?
   ├── Port?
   └── Password?

   