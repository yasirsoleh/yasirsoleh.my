import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <a href="https://github.com/yasirsoleh">
            <img
              class="rounded-full w-64 h-64"
              alt="yasirsoleh's avatar"
              src="https://avatars.githubusercontent.com/u/29148434?v=4"
            />
          </a>
          <p class="my-4">
            The page you were looking for doesn't exist.
          </p>
          <a href="/" class="underline">Go back home</a>
        </div>
      </div>
    </>
  );
}
