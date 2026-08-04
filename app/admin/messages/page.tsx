import { listMessages } from "../../../lib/db/messages";
import { formatDateTime } from "../../../lib/format";

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">Messages</h1>
        <p className="mt-2 text-[#746f67]">Contact form submissions stored in D1.</p>
      </div>
      <div className="grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="border border-[#d7d0c5] bg-[#f8f4ed] p-5">
            <h2 className="editorial-title text-2xl">{message.subject}</h2>
            <p className="mt-2 text-sm text-[#746f67]">
              {message.name} · {message.email} · {formatDateTime(message.created_at)}
            </p>
            {message.artwork_reference ? <p className="mt-2 text-sm">Artwork: {message.artwork_reference}</p> : null}
            <p className="mt-4 whitespace-pre-wrap leading-7">{message.message}</p>
          </article>
        ))}
        {!messages.length ? <p className="border border-[#d7d0c5] p-6 text-[#746f67]">No messages yet.</p> : null}
      </div>
    </div>
  );
}
