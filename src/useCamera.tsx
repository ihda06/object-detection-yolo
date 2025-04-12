import { useEffect, useRef, useState } from "react";

export interface UseCameraProps {
  /**
   * Callback yang akan dipanggil setiap kali gambar berhasil ditangkap.
   * Menerima dua parameter:
   * - imageData: URL data gambar (string)
   * - canvas: elemen canvas yang berisi gambar
   */
  onCapture?: (imageData: string, canvas: HTMLCanvasElement) => void;
  /**
   * Interval (dalam milidetik) untuk menangkap gambar secara otomatis.
   * Jika tidak disediakan, maka hanya capture manual yang tersedia.
   */
  captureInterval?: number;
}

export default function useCamera({
  onCapture,
  captureInterval,
}: UseCameraProps = {}) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isCameraError, setIsCameraError] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<
    MediaDeviceInfo | undefined
  >();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fungsi untuk melakukan capture gambar secara manual
  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        if (onCapture) {
          onCapture(imageDataUrl, canvas);
        }
        return imageDataUrl;
      }
    }
    return "";
  };

  // Fungsi untuk memulai kamera
  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      // Gunakan konfigurasi berdasarkan kamera yang dipilih (jika ada)
      const constraints = selectedCamera
        ? { video: { deviceId: { exact: selectedCamera.deviceId } } }
        : { video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Jika permission belum diatur, ambil daftar kamera yang tersedia
      if (hasPermission === null) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0]);
        }
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setHasPermission(true);
      setIsCameraOn(true);
      setIsCameraError(false);

      // Jika captureInterval disediakan, mulai interval untuk capture otomatis
      if (captureInterval) {
        intervalRef.current = setInterval(() => {
          captureImage();
        }, captureInterval);
      }
    } catch (error) {
      setIsCameraError(true);
      console.error("Error accessing camera:", error);
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Fungsi untuk menghentikan kamera dan membersihkan interval
  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      videoRef.current!.srcObject = null;
    }

    setIsCameraOn(false);
  };

  // Fungsi untuk mengganti kamera aktif
  const changeCamera = (deviceId: string) => {
    const camera = cameras.find((cam) => cam.deviceId === deviceId);
    if (camera) {
      setSelectedCamera(camera);
    }
  };

  // Ambil daftar kamera yang tersedia saat komponen mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput" && device.deviceId !== ""
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0]);
        }
      } catch (error) {
        console.error("Error fetching cameras:", error);
      }
    };
    fetchCameras();
  }, []);

  return {
    hasPermission,
    isCameraOn,
    isCameraError,
    isCameraLoading,
    cameras,
    selectedCamera,
    videoRef,
    startCamera,
    stopCamera,
    changeCamera,
    captureImage,
  };
}
