export default function() {
  return {
    async middleware(context) {
      context.type = context.req ? 'server' : 'client'
    }
  }
}
