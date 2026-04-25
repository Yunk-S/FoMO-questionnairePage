import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-5">
      <div className="glass-panel rounded-panel p-6">
        <p className="text-sm font-semibold tracking-[0.22em] text-coral">NOT FOUND</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">没有找到这份页面</h1>
        <p className="mt-3 text-sm leading-6 text-moss">链接可能已经失效，或对应的答题记录不存在。</p>
        <Link
          href="/"
          className="glass-button mt-5 inline-flex min-h-11 items-center rounded-panel px-4 text-sm font-semibold text-moss"
        >
          返回问卷
        </Link>
      </div>
    </div>
  );
}
