// src/app/page.tsx
"use client";
import HomePage from "./HomePage";
import Link from "next/link";

export default function Page() {
  return (
    <HomePage>
      <div className="flex gap-4 mt-8">
        <Link href="/results">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all duration-200">
            Results
          </button>
        </Link>
      </div>
    </HomePage>
  );
}
