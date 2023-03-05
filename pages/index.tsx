import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [generatedResponse, setgeneratedResponse] = useState<String>("");

  const responseRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (responseRef.current !== null) {
      responseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generateBio = async (e: any) => {
    e.preventDefault();
    setgeneratedResponse("");

    const placeholderValue = "Why is the answer to everything 42?";
    const prompt = bio.trim().length ? `${bio}` : `${placeholderValue}`;


    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setgeneratedResponse((prev) => prev + chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>chatGPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-6 sm:mt-6">

        <h1 className="sm:text-4xl text-4xl max-w-[708px] font-bold text-slate-900">
          chatGPT
        </h1>
        <div className="max-w-xl w-full">

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                generateBio(e);
              }
            }}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={"Why is the answert to everything 42?"}
          />

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Ask me anything!
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-2 my-2">
          {generatedResponse && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={responseRef}
                ></h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
              <div
                className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                onClick={() => {
                  navigator.clipboard.writeText(generatedResponse);
                  toast("Bio copied to clipboard", {
                    icon: "✂️",
                  });
                }}
                key={generatedResponse}
              >
                <p>{generatedResponse}</p>
              </div>
              </div>


            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
