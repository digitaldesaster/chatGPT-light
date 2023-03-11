import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [generatedResponse, setgeneratedResponse] = useState<String>("");
  const [currentQuestion, setCurrentQuestion] = useState<String>("");

  const generateBio = async (e: any) => {
    e.preventDefault();

    const context = generatedResponse;

    setgeneratedResponse("");

    const placeholderValue = "Why is the answer to everything 42?";
    var prompt = bio.trim().length ? `${bio}` : `${placeholderValue}`;

    if (context)
    {
      prompt = prompt + '\n' + 'Context: ' + context
    }

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

    const lastEle = document.querySelector("#content-area .qa-wrapper:last-child");
    lastEle?.parentElement?.insertBefore(lastEle?.cloneNode(true), lastEle);

    setCurrentQuestion("");
    setLoading(false);
    setBio("");
  };

  function QuestionsAndAnswers(question: string) {
    if (!question) return (<div></div>)
    return (
      <div key={question.toString()} className="qa-wrapper">
        <div className="space-y-2 py-2 px-2 question w-full">
          <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
            {question}
          </div>
        </div>
        <div className="space-y-2 py-2 px-2 answer w-full">
          {generatedResponse && (
            <>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                <div
                  key={generatedResponse.toString()}
                >
                  <p>{generatedResponse.toString()}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex mx-auto flex-col items-center" id="parent">
      <Head>
        <title>ChatGPT light</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="sm:text-4xl text-4xl w-full font-bold text-slate-900 text-center text-black">
          ChatGPT light
      </h1>

      <main className="flex flex-1 w-full flex-col items-center">

        <div id="content-area" className="flex-1 w-full">
          {QuestionsAndAnswers(currentQuestion)}
        </div>

        <div className="max-w-xl w-full">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentQuestion(e.target.value)
                generateBio(e);
              }
            }}
            rows={2}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={"Insert your question here..."}
          />
          // <div id="buttons" className="flex mb-2">
          //   {!loading && (
          //     <button
          //       className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-full"
          //       onClick={(e) => {
          //         setCurrentQuestion(bio);
          //         generateBio(e);
          //       }}
          //     >
          //       Submit question
          //     </button>
          //   )}
          //   {loading && (
          //     <button
          //       className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-full"
          //       disabled
          //     >
          //       <LoadingDots color="white" style="large" />
          //     </button>
          //   )}
          //   <button
          //   className="bg-red-500 rounded-xl text-white font-medium px-4 py-2 hover:bg-red-600 w-full"
          //   onClick={() => window.location.reload()}
          // >
          //   Reset
          // </button>
          // </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
