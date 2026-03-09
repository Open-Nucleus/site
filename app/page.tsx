export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="max-w-lg text-center">
        <h1 className="cursor-blink text-3xl font-bold tracking-tight sm:text-4xl">
          Open Nucleus
        </h1>

        <hr className="mx-auto my-6 w-64 border-t border-black" />

        <p className="text-lg leading-relaxed">
          An offline-first electronic health record
          <br />
          for places where connectivity is zero.
        </p>

        <p className="mt-6 text-base leading-relaxed opacity-70">
          Git is the database. Sync is Git sync.
          <br />
          Runs on a Raspberry Pi.
        </p>

        <a
          href="https://github.com/open-nucleus"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block underline underline-offset-4 hover:opacity-60"
        >
          GitHub &rarr;
        </a>
      </main>
    </div>
  );
}
