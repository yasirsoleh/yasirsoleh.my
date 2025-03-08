export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto max-w-screen-md">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <a href="https://github.com/yasirsoleh">
          <img
            class="rounded-full w-64 h-64"
            alt="yasirsoleh's avatar"
            src="https://avatars.githubusercontent.com/u/29148434?v=4"
          />
        </a>

        <h1 class="mt-4 text-4xl font-bold text-center">
          Mohammad Alif Yasir bin Soleh
        </h1>
        <div class="my-4 space-y-2">
          <p class="text-gray-600 text-center">
            R&amp;D Software Engineer{"  "}
            <text
              x="64"
              y="64"
              font-size="96"
              text-anchor="middle"
              dominant-baseline="middle"
              font-family="serif"
            >
              👨‍💻
            </text>
            <br />
            at Elid Sales &amp; Marketing Sdn Bhd
          </p>
          <p class="text-gray-600 text-center">Petaling Jaya, Malaysia</p>
        </div>
        <div class="flex space-x-4 mt-4">
          <a
            href="mailto:yasirsoleh@gmail.com"
            class="text-gray-800 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-at-sign"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
            </svg>
          </a>
          <a
            href="https://github.com/yasirsoleh"
            class="text-gray-800 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
