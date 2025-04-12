import { useEffect, useMemo, useState } from "react";

import "./App.css";

import * as tf from "@tensorflow/tfjs";
import Button from "./components/button";

import { DisplayRealtime, DisplayUpload } from "./components/display";

function App() {
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [modeSelect, setModeSelect] = useState("");

  const [model, setModel] = useState<{
    net: tf.GraphModel<string | tf.io.IOHandler> | null;
    inputShape: number[];
  }>({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.origin}/yolov7tiny_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      if (!yolov8) return;

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape!);
      const warmupResults = await yolov8.executeAsync(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape ?? [1, 0, 0, 3],
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  const DisplayMode = useMemo(() => {
    switch (modeSelect) {
      case "realtime":
        return (
          <DisplayRealtime model={model} onBack={() => setModeSelect("")} />
        );
      // case "image":
      //   return <DisplayImage model={model} />;
      case "upload":
        return <DisplayUpload model={model} onBack={() => setModeSelect("")} />;

      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeSelect]);

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-slate-900 to-slate-700">
      <BackgroundDot />
      <div className="w-screen h-screen z-10 absolute">
        <div className="h-full w-full flex flex-col justify-center items-center text-white">
          {loading.loading ? (
            <div className="flex justify-center items-center gap-3">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <h1>Loading Model... {(loading.progress * 100).toFixed(2)}%</h1>
            </div>
          ) : (
            <>
              {DisplayMode}
              <div
                className="flex flex-col gap-3 justify-center items-center"
                style={{ display: modeSelect ? "none" : "flex" }}
              >
                {/* <img src={`${window.location.origin}/img.png`} alt="img" /> */}
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-extrabold text-white flex justify-center items-center gap-3">
                    <span>AI Sees What You See</span>
                    <span role="img" aria-label="vision icon">
                      🤖👁️
                    </span>
                  </h1>
                  <p className="text-lg text-gray-200 mt-2 flex justify-center items-center gap-2">
                    <span role="img" aria-label="radar">
                      📡
                    </span>
                    Powered by{" "}
                    <strong className="mx-1 text-white">YOLOv7-Tiny</strong> ·
                    Real-Time Object Detection
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setModeSelect("realtime");
                    }}
                  >
                    Real-time Detection
                  </Button>

                  <Button
                    onClick={() => {
                      setModeSelect("upload");
                    }}
                  >
                    From Image
                  </Button>
                </div>
                <div className="flex gap-3">
                  <p>Made with ❤️ by Ihda Anwari</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/ihda06"
                    className="py-1 px-2 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white duration-300"
                  >
                    Github
                  </a>{" "}
                  <a
                    href="https://linkedin.com/in/ihda-anwari"
                    className="py-1 px-2 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white duration-300"
                  >
                    Linkedin
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const BackgroundDot = () => {
  return useMemo(
    () => (
      <div className="w-screen h-screen absolute z-[1] overflow-hidden">
        {Array.from({ length: 30 }, (_, i) => {
          const colors = [
            "#ffffff",
            "#ffe082",
            "#90caf9",
            "#f48fb1",
            "#a5d6a7",
          ]; // warna acak
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.floor(Math.random() * 4) + 2; // ukuran antara 2px - 5px

          return (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: randomColor,
              }}
            ></div>
          );
        })}
      </div>
    ),
    []
  );
};

export default App;
