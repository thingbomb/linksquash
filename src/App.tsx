import { createStoredSignal } from "./hooks/localStorage";
import { TextField, TextFieldRoot } from "@/components/ui/input";
import { TrashIcon, Download, Upload } from "lucide-solid";
import { createSignal, For, JSX } from "solid-js";

function debounce(fn: Function, ms: number) {
  let timeoutId: number | undefined;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms) as unknown as number;
  };
}

type AliasEntry = {
  id: string;
  path: string;
  url: string;
};

let stableAliasArray: AliasEntry[] = [];

function App() {
  const [aliases, setAliases] = createStoredSignal<Record<string, string>>(
    "aliases",
    {}
  );

  const [stableEntries, setStableEntries] =
    createSignal<AliasEntry[]>(stableAliasArray);

  if (stableAliasArray.length === 0) {
    const initialData = Object.entries(aliases()).map(([path, url]) => ({
      id: crypto.randomUUID(),
      path,
      url,
    }));

    stableAliasArray.push(...initialData);
  }

  const syncToStorage = () => {
    const storage: Record<string, string> = {};
    stableAliasArray.forEach((entry) => {
      if (entry.path.trim()) {
        storage[entry.path] = entry.url;
      }
    });
    setAliases(storage);
  };

  const debouncedSync = debounce(syncToStorage, 500);

  const [activeFocus, setActiveFocus] = createSignal<string | null>(null);

  const exportAliasesToCSV = () => {
    syncToStorage();
    const currentAliases = aliases();
    if (Object.keys(currentAliases).length === 0) {
      alert("No aliases to export");
      return;
    }

    let csvContent = "alias,url\n";
    Object.entries(currentAliases).forEach(([alias, url]) => {
      const escapedAlias = alias.includes(",")
        ? `"${alias.replace(/"/g, '""')}"`
        : alias;
      const escapedUrl = url.includes(",")
        ? `"${url.replace(/"/g, '""')}"`
        : url;
      csvContent += `${escapedAlias},${escapedUrl}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `linksquash-aliases-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importAliasesFromCSV: JSX.EventHandler<HTMLInputElement, Event> = (
    event
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Could not read file content");

        const lines = content.split(/\r?\n/);
        if (lines.length < 2)
          throw new Error("CSV file is empty or has no data rows");

        const header = lines[0].toLowerCase();
        if (!header.includes("alias") || !header.includes("url")) {
          throw new Error("CSV file must have 'alias' and 'url' columns");
        }

        const newAliases: Record<string, string> = {};

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          let parts: string[] = [];
          let inQuotes = false;
          let currentPart = "";

          for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"') {
              if (j + 1 < line.length && line[j + 1] === '"') {
                currentPart += '"';
                j++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              parts.push(currentPart);
              currentPart = "";
            } else {
              currentPart += char;
            }
          }

          parts.push(currentPart);

          if (parts.length >= 2) {
            const [alias, url] = parts;
            if (alias && url) {
              newAliases[alias] = url;
            }
          }
        }

        if (Object.keys(newAliases).length === 0) {
          throw new Error("No valid aliases found in CSV");
        }

        const existingCount = Object.keys(aliases()).length;
        if (existingCount > 0) {
          if (
            confirm(
              `You have ${existingCount} existing aliases. Do you want to merge the imported aliases with your existing ones? Click Cancel to replace all existing aliases.`
            )
          ) {
            setAliases({ ...aliases(), ...newAliases });
          } else {
            setAliases(newAliases);
          }

          stableAliasArray.length = 0;
          Object.entries({ ...aliases() }).forEach(([path, url]) => {
            stableAliasArray.push({
              id: crypto.randomUUID(),
              path,
              url,
            });
          });

          setStableEntries([...stableAliasArray]);
        } else {
          setAliases(newAliases);

          stableAliasArray.length = 0;
          Object.entries(newAliases).forEach(([path, url]) => {
            stableAliasArray.push({
              id: crypto.randomUUID(),
              path,
              url,
            });
          });

          setStableEntries([...stableAliasArray]);
        }

        alert(
          `Successfully imported ${Object.keys(newAliases).length} aliases`
        );
      } catch (error) {
        console.error("Error importing CSV:", error);
        alert(
          `Error importing CSV: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      event.currentTarget.value = "";
    };

    reader.onerror = () => {
      alert("Error reading the file");
    };

    reader.readAsText(file);
  };

  window.addEventListener("hashchange", () => {
    const aliases = localStorage.getItem("aliases");
    const parsedAliases = aliases ? JSON.parse(aliases) : {};
    const trimmedHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    if (Object.keys(parsedAliases).length > 0 && parsedAliases[trimmedHash]) {
      window.location.href = parsedAliases[trimmedHash];
    }
  });

  return (
    <div class="p-10 text-center pt-20 max-w-4xl m-auto text-black dark:text-white">
      <h1 class="text-5xl tracking-tight font-bold text-black dark:text-white select-none mb-3">
        Linksquash
      </h1>
      <p class="text-xl mb-5">
        Create your own URL aliases on linksquash.com. Your aliases are all
        yours; aliases are stored locally in your browser and only work for you.
        Make sure you save backups since browsers can be unpredictable and your
        data could be lost at any moment.
      </p>

      <div class="flex gap-2 justify-center mb-5">
        <button
          onClick={exportAliasesToCSV}
          class="flex items-center gap-2 text-white bg-black dark:text-black dark:bg-white rounded-md border-1 border-white/50 font-semibold p-2 hover:bg-black/80 dark:hover:bg-white/80"
        >
          <Download class="size-4" /> Export as CSV
        </button>
        <label class="flex items-center gap-2 text-white bg-black dark:text-black dark:bg-white rounded-md border-1 border-white/50 font-semibold p-2 hover:bg-black/80 dark:hover:bg-white/80 cursor-pointer">
          <Upload class="size-4" /> Import from CSV
          <input
            type="file"
            accept=".csv"
            class="hidden"
            onChange={importAliasesFromCSV}
          />
        </label>
      </div>

      <div class="mb-6">
        <For each={stableEntries()}>
          {(entry) => (
            <div class="flex gap-1 mt-1">
              <TextFieldRoot class="flex-1">
                <TextField
                  placeholder="Alias (/pathname)"
                  value={entry.path}
                  onInput={(e) => {
                    entry.path = e.currentTarget.value;
                    debouncedSync();
                  }}
                  onBlur={() => {
                    setActiveFocus(null);
                    syncToStorage();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === "/") {
                      e.preventDefault();
                    }
                  }}
                  id={`alias-${entry.id}`}
                  autofocus={activeFocus() === `alias-${entry.id}`}
                  onFocus={() => setActiveFocus(`alias-${entry.id}`)}
                  class="font-semibold w-full"
                />
              </TextFieldRoot>
              <TextFieldRoot class="flex-1">
                <TextField
                  placeholder="URL"
                  value={entry.url}
                  onInput={(e) => {
                    entry.url = e.currentTarget.value;
                    debouncedSync();
                  }}
                  onBlur={() => {
                    setActiveFocus(null);
                    syncToStorage();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  autofocus={activeFocus() === `url-${entry.id}`}
                  onFocus={() => {
                    setActiveFocus(`url-${entry.id}`);
                  }}
                  id={`url-${entry.id}`}
                  class="font-semibold w-full"
                />
              </TextFieldRoot>
              <button
                class="text-white bg-black dark:text-black dark:bg-white rounded-md border-1 border-white/50 font-semibold p-1 hover:bg-black/80 dark:hover:bg-white/80"
                onClick={() => {
                  const index = stableAliasArray.findIndex(
                    (item) => item.id === entry.id
                  );
                  if (index !== -1) {
                    stableAliasArray.splice(index, 1);
                    setStableEntries([...stableAliasArray]);
                    syncToStorage();
                  }
                }}
              >
                <TrashIcon class="size-5" />
              </button>
            </div>
          )}
        </For>
        <button
          onClick={() => {
            const newEntry = { id: crypto.randomUUID(), path: "", url: "" };
            stableAliasArray.push(newEntry);
            setStableEntries([...stableAliasArray]);
          }}
          class="text-white mt-2 bg-black dark:text-black dark:bg-white rounded-md border-1 border-white/50 font-semibold p-2 w-full hover:bg-black/80 dark:hover:bg-white/80"
        >
          Add new alias
        </button>
        <br />
        <br />
        <footer>
          <a href="/about/privacy">Privacy Policy</a>
        </footer>
      </div>
    </div>
  );
}

export default App;
