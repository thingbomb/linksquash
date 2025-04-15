/*
  Copyright © 2023 shadcn Copyright © 2023 hngngn

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the “Software”), to deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
  DEALINGS IN THE SOFTWARE.
*/

import { cn } from "@/libs/cn";
import { cva } from "class-variance-authority";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";

export const textfieldLabel = cva(
  "text-sm font-medium data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  {
    variants: {
      label: {
        true: "data-[invalid]:text-destructive",
      },
      error: {
        true: "text-destructive text-xs",
      },
      description: {
        true: "font-normal text-muted-foreground",
      },
    },
    defaultVariants: {
      label: true,
    },
  }
);

export const TextFieldRoot = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cn("space-y-1", local.class)} {...rest} />;
};

export const TextFieldLabel = (
  props: JSX.LabelHTMLAttributes<HTMLLabelElement>
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <label class={cn(textfieldLabel(), local.class)} {...rest} />;
};

export const TextFieldDescription = (
  props: JSX.HTMLAttributes<HTMLDivElement>
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        textfieldLabel({ description: true, label: false }),
        local.class
      )}
      {...rest}
    />
  );
};

export const TextFieldErrorMessage = (
  props: JSX.HTMLAttributes<HTMLDivElement>
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class={cn(textfieldLabel({ error: true }), local.class)} {...rest} />
  );
};

export const TextField = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        `focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md
        border border-zinc-200 bg-zinc-100 px-3.5 py-0 text-[13px] font-medium
        shadow-inner shadow-white/5 transition-[color,background-color,box-shadow]
        !select-none hover:bg-zinc-200 focus:bg-zinc-200 focus-visible:ring-[1.5px]
        focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50
        dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700
        dark:focus:bg-zinc-700 dark:placeholder:text-zinc-400 text-black dark:text-white`,
        local.class
      )}
      {...rest}
    />
  );
};
