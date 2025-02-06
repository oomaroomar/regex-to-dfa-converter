"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import DFA from "~/components/ui/DFA";
import { Input } from "~/components/ui/input";

export default function HomePage() {
  const [regex, setRegex] = useState("");
  const [regexToConvert, setRegexToConvert] = useState("a");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-black">
      <div className="flex flex-col gap-2">
        <h1>Regex here</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRegexToConvert(regex);
          }}
        >
          <Input
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            type="text"
            placeholder="Enter a regex"
          />
          <Button type="submit">Submit</Button>
        </form>
      </div>
      <div className="flex h-full min-h-96 flex-col gap-2">
        <h1>DFA here</h1>
        <DFA regex={regexToConvert} />
      </div>
    </main>
  );
}
