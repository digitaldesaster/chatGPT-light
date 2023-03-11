import type { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [generatedResponse, setgeneratedResponse] = useState<String>("");
  const [currentQuestion, setCurrentQuestion] = useState<String>("");
  const placeholderValue = "Why is the answer to everything 42?";

  const responseRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (responseRef.current !== null) {
      responseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  const generateBio = async (e: any) => {
    e.preventDefault();

    const context = generatedResponse;

    setgeneratedResponse("");


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

      <div class="flex justify-start mt-8">
        <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 mr-2">
          <span class="text-white font-bold text-2xl">Q</span>
        </div>
        <div class="flex-grow">
          <p class="text-xl text-gray-500 text-left max-w-2xl">{question}</p>
        </div>
      </div>

      <div class="flex justify-end mt-8">

          <p class="text-xl text-gray-500 mr-2 text-right max-w-2xl">


          {generatedResponse && (
            <>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto" ref={responseRef}>
                <div
                  key={generatedResponse.toString()}
                >
                  <p>{generatedResponse.toString()}</p>
                </div>
              </div>
            </>
          )}



          </p>

        <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 mr-2">
          <span class="text-white font-bold text-2xl">A</span>
        </div>
      </div>

      </div>
    )
  }

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
        <Head>
          <title>Next.js + TailwindCSS</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

   <header class="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
    <div class="flex items-center justify-between px-4 py-5">
      <div class="relative flex items-center">
        <div class="absolute top-1/2 transform -translate-y-1/2 left-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500">
          <span class="text-white font-bold text-2xl">C</span>
        </div>
        <span class="z-10 ml-16 font-medium text-gray-700 text-2xl">chatGPT</span>
      </div>
      <div class="flex items-center space-x-4">
        <a href="#" class="text-gray-600 hover:text-gray-800 font-medium">Home</a>
        <a href="#" class="text-gray-600 hover:text-gray-800 font-medium">About</a>
        <a href="#" class="text-gray-600 hover:text-gray-800 font-medium">Contact</a>
      </div>
    </div>
  </header>

  <main class="flex w-full flex-1 flex-col justify-start px-20 py-8 pt-16 justify-start">

    <div id="content-area" className="flex-1 w-full">
      {QuestionsAndAnswers(currentQuestion)}
    </div>

    {/* Rest of the content goes here */}


    <div class="fixed bottom-0 left-0 w-full flex items-end justify-center mb-16">
    <div class="flex w-3/5 items-center">
      <textarea
        class="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        placeholder={placeholderValue}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setCurrentQuestion(e.target.value)
            generateBio(e);
          }
        }}
        onInput={(event) => {
          event.target.rows = 1;
          const rowsNeeded = Math.ceil(event.target.scrollHeight / 16);
          if (rowsNeeded <= 6) {
            event.target.rows = rowsNeeded;
          } else {
            event.target.rows = 6;
            event.target.scrollTop = event.target.scrollHeight;
          }
        }}
      ></textarea>
      <button class="flex-shrink-0 w-12 h-full rounded-r-md bg-blue-500 hover:bg-blue-600 text-white" type="button">
        Send
      </button>
    </div>
  </div>




  </main>









  <footer className="fixed bottom-0 flex h-10 w-full items-center justify-center border-t bg-zinc-50">
          <a
            className="flex items-center justify-center gap-2"
            href="https://replit.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}

          </a>
        </footer>
      </div>
    )


};

export default Home;
