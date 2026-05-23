/**
 * Hocuspocus WebSocket server for real-time collaborative editing.
 *
 * Run with:  npm run collab
 *
 * The server listens on PORT (default 1234) and keeps all documents
 * in-memory.  Swap the extensions array to add persistence (e.g.
 * @hocuspocus/extension-database) or authentication later.
 */

import { Server } from '@hocuspocus/server'

const PORT = process.env.HOCUSPOCUS_PORT
  ? parseInt(process.env.HOCUSPOCUS_PORT, 10)
  : 1234

const server = new Server({
  port: PORT,

  // ── Lifecycle hooks (all optional — add auth / persistence here later) ─

  async onConnect(data) {
    console.log(`[hocuspocus] client connected   — doc: "${data.documentName}"`)
  },

  async onDisconnect(data) {
    console.log(`[hocuspocus] client disconnected — doc: "${data.documentName}"`)
  },

  async onCreateDocument(data) {
    console.log(`[hocuspocus] document created    — "${data.documentName}"`)
  },

  async onChange(data) {
    // Called on every document change.
    // Hook into this to persist updates to your database.
    console.log(`[hocuspocus] document changed    — "${data.documentName}"`)
  },
})

server.listen().then(() => {
  console.log(`[hocuspocus] WebSocket server ready on ws://localhost:${PORT}`)
})
