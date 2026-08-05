import { listMessages } from "../../../lib/db/messages";
import { formatDateTime } from "../../../lib/format";

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">Messages</h1>
        <p className="mt-2 text-[#084A24]">Contact form submissions stored in D1.</p>
      </div>
      <div className="grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="border border-[#084A24]/25 bg-[#F2EDD5] p-5">
            <h2 className="editorial-title text-2xl">{message.subject}</h2>
            <p className="mt-2 text-sm text-[#084A24]">
              {message.name} · {message.email} · {formatDateTime(message.created_at)}
            </p>
            {message.artwork_reference ? <p className="mt-2 text-sm">Artwork: {message.artwork_reference}</p> : null}
            <p className="mt-4 whitespace-pre-wrap leading-7">{message.message}</p>
          </article>
        ))}
        {!messages.length ? <p className="border border-[#084A24]/25 p-6 text-[#084A24]">No messages yet.</p> : null}
      </div>
    </div>
  );
}
