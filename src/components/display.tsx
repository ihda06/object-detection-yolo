import * as tf from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import { detect2, detectVideo } from "../utils/detect";
import useCamera from "../hooks/useCamera";
import { cn } from "../utils/utils";
import Button from "./button";

export const DisplayRealtime = ({
  model,
  onBack,
}: {
  model: {
    net: tf.GraphModel<string | tf.io.IOHandler> | null;
    inputShape: number[];
  };
  onBack: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isCameraOn, videoRef, isCameraLoading, startCamera, stopCamera } =
    useCamera({});
  useEffect(() => {
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col gap-3  bg-white text-black rounded-lg p-5 opacity-90">
      <div className="flex justify-between">
        <Button
          onClick={() => {
            stopCamera();
            onBack();
          }}
          className="text-lg font-extrabold bg-transparent hover:underline hover:bg-transparent text-black"
        >
          Back
        </Button>
      </div>
      <div className="flex w-full justify-center items-center">
        <div
          className="relative overflow-hidden"
          style={{ display: isCameraOn ? "block" : "none" }}
        >
          <video
            ref={videoRef}
            className={cn("max-h-[500px] w-full max-w-[720px] rounded-lg")}
            autoPlay
            muted
            height={"100%"}
            onPlay={() => {
              if (!videoRef.current) return;
              detectVideo(
                videoRef.current,
                { net: model.net!, inputShape: model.inputShape },
                canvasRef.current!,
                50
              );
            }}
          />
          <canvas
            ref={canvasRef}
            id="canvas"
            className="absolute left-0 top-0 h-full w-full"
            width={model.inputShape[1]}
            height={model.inputShape[2]}
          ></canvas>
        </div>
        {isCameraLoading && (
          <div className="w-[720px] h-[500px] bg-gray-800 rounded-2xl flex justify-center items-center text-white">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const DisplayUpload = ({
  model,
  onBack,
}: {
  model: {
    net: tf.GraphModel<string | tf.io.IOHandler> | null;
    inputShape: number[];
  };
  onBack: () => void;
}) => {
  const [imageLink, setImageLink] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputImageRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-3  bg-white text-black rounded-lg p-5 opacity-90">
      <div className="flex justify-between">
        <Button
          onClick={() => {
            setImageLink("");
            onBack();
          }}
          className="text-lg font-extrabold bg-transparent hover:underline hover:bg-transparent text-black"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            inputImageRef.current?.click();
          }}
          className="text-lg font-extrabold bg-transparent hover:underline hover:bg-transparent text-black"
        >
          Change
        </Button>
      </div>
      <div className="flex w-full justify-center items-center">
        <div
          className="relative overflow-hidden"
          style={{ display: imageLink ? "block" : "none" }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const url = URL.createObjectURL(e.target.files![0]); // create blob url
              setImageLink(url);
            }}
            ref={inputImageRef}
          />
          <img
            ref={imageRef}
            alt="dog_bike_car"
            src={imageLink || "/"}
            width={1080}
            height={720}
            className={cn("max-h-[500px] w-full max-w-[720px] rounded-lg")}
            onLoad={() => {
              if (!imageRef.current || !imageLink) return;

              detect2(
                imageRef.current!,
                { net: model.net!, inputShape: model.inputShape },
                50,
                canvasRef.current!
              );
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 w-full h-full"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            width={model.inputShape[1]}
            height={model.inputShape[2]}
          ></canvas>
        </div>
        <div
          className="w-[720px] h-[500px] bg-gray-800 rounded-2xl flex justify-center items-center"
          style={{ display: imageLink ? "none" : "flex" }}
        >
          <Button
            onClick={() => {
              if (!imageLink) {
                inputImageRef.current?.click();
              } else {
                setImageLink("");

                const ctx = canvasRef.current?.getContext("2d");
                if (ctx) {
                  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
                }
              }
            }}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
