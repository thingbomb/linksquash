import { createSignal, onCleanup, Signal } from "solid-js";

const subscribers: Record<string, Array<(value: any) => void>> = {};

function safeParse<T>(data: any, fallback: T): T {
  try {
    if (typeof data === "string") {
      if (data === "true") return true as T;
      if (data === "false") return false as T;
      if (data === "null") return null as T;
      if (data.startsWith("{") || data.startsWith("[")) {
        return JSON.parse(data);
      }
    }
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

function createStoredSignal<T>(key: string, defaultValue: T): Signal<T> {
  const getFromStorage = (): T | null => {
    let storedValue = localStorage.getItem(key);
    if (storedValue !== "null") {
      const parsed = safeParse(storedValue, defaultValue);
      return parsed;
    }

    return null;
  };

  const initialValue = getFromStorage() ?? defaultValue;

  const [value, setValue] = createSignal<T>(initialValue);

  const setToStorage = (newValue: T) => {
    const stringifiedValue: string =
      typeof newValue === "object" && newValue !== null
        ? JSON.stringify(newValue)
        : String(newValue);
    localStorage.setItem(key, stringifiedValue);
  };

  const setValueAndStore = (newValue: T) => {
    // @ts-ignore
    setValue(newValue);
    setToStorage(newValue);

    if (subscribers[key]) {
      subscribers[key].forEach((callback) => callback(newValue));
    }

    return newValue;
  };

  if (!subscribers[key]) {
    subscribers[key] = [];
  }
  subscribers[key].push(setValue);

  onCleanup(() => {
    subscribers[key] = subscribers[key].filter(
      (callback) => callback !== setValue
    );
  });

  // @ts-ignore
  return [value, setValueAndStore];
}

export { createStoredSignal };
