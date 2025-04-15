export default function NotFound() {
  const pathname = window.location.pathname;
  return (
    <div class="p-10 text-center pt-20 max-w-4xl m-auto text-black dark:text-white">
      <h1 class="text-5xl tracking-tight font-bold text-black dark:text-white select-none mb-3">
        Alias not found
      </h1>
      <p class="text-xl mb-5">
        The alias{" "}
        <code class="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
          {pathname}
        </code>{" "}
        was not found. If someone sent you this alias, it won't work since
        Linksquash aliases are stored locally in your browser and only work for
        you. Your browser may also have cleared your data, in which case you
        restore from a saved Linksquash backup if you have one. Otherwise, you
        will not be able to use this alias.
      </p>
    </div>
  );
}
