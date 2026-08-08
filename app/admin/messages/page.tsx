import Link from "next/link";
import { RotateCcw, Star, Trash2 } from "lucide-react";
import { moveMessageToTrash, restoreMessageFromTrash, toggleMessageStar } from "../actions";
import { listMessages } from "../../../lib/db/messages";
import { formatDateTime } from "../../../lib/format";

type Props = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminMessagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const trashed = params.view === "trash";
  const starred = params.view === "starred";
  const messages = await listMessages({ starred, trashed });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-4xl">Messages</h1>
          <p className="mt-2 text-[#084A24]">
            {trashed
              ? "Messages moved out of the inbox."
              : starred
                ? "Starred inbox messages."
                : "Contact form submissions stored in D1."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/messages" className={`button button-secondary ${!trashed && !starred ? "opacity-70" : ""}`}>
            Inbox
          </Link>
          <Link href="/admin/messages?view=starred" className={`button button-secondary ${starred ? "opacity-70" : ""}`}>
            <Star size={18} aria-hidden />
            Starred
          </Link>
          <Link href="/admin/messages?view=trash" className={`button button-secondary ${trashed ? "opacity-70" : ""}`}>
            <Trash2 size={18} aria-hidden />
            Trash
          </Link>
        </div>
      </div>
      <div className="grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="border border-[#084A24]/25 bg-[#F2EDD5] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="editorial-title text-2xl">{message.subject}</h2>
                <p className="mt-2 text-sm text-[#084A24]">
                  {message.name} / {message.email} / {formatDateTime(message.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggleMessageStar}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="starred" value={String(message.is_starred)} />
                  <button
                    className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]"
                    title={message.is_starred ? "Unstar message" : "Star message"}
                  >
                    <Star size={16} fill={message.is_starred ? "currentColor" : "none"} aria-hidden />
                  </button>
                </form>
                {trashed ? (
                  <form action={restoreMessageFromTrash}>
                    <input type="hidden" name="id" value={message.id} />
                    <button className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Restore message">
                      <RotateCcw size={16} aria-hidden />
                    </button>
                  </form>
                ) : (
                  <form action={moveMessageToTrash}>
                    <input type="hidden" name="id" value={message.id} />
                    <button className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Move to trash">
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </form>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-[#084A24]">
              {message.is_starred ? "Starred" : "Not starred"} /{" "}
              {message.reviewed_at ? `Reviewed ${formatDateTime(message.reviewed_at)}` : "Not reviewed"}
            </p>
            {message.artwork_reference ? <p className="mt-2 text-sm">Artwork: {message.artwork_reference}</p> : null}
            <p className="mt-4 whitespace-pre-wrap leading-7">{message.message}</p>
          </article>
        ))}
        {!messages.length ? (
          <p className="border border-[#084A24]/25 p-6 text-[#084A24]">
            {trashed ? "Trash is empty." : starred ? "No starred messages yet." : "No messages yet."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
