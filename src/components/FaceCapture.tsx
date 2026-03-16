import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from './ui/Primitives';
import { Camera, Loader2, RefreshCw } from 'lucide-react';

interface FaceCaptureProps {
    onCapture: (descriptor: Float32Array, imageBase64: string) => void;
    mode?: 'register' | 'verify';
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, mode = 'register' }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [feedback, setFeedback] = useState("Carregando modelos IA...");

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                setFeedback("Posicione seu rosto no centro");
            } catch (error) {
                console.error("Error loading models:", error);
                setFeedback("Erro ao carregar IA. Verifique pasta /public/models");
            }
        };
        loadModels();
    }, []);

    const handleCapture = async () => {
        if (!webcamRef.current || !canvasRef.current || !modelsLoaded) return;

        setDetecting(true);
        const video = webcamRef.current.video;
        if (!video) return;

        try {
            // Detect face
            const detection = await faceapi.detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                const resizedDetections = faceapi.resizeResults(detection, {
                    width: video.videoWidth,
                    height: video.videoHeight
                });

                // Draw detection on canvas
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                }

                if (detection.descriptor) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        onCapture(detection.descriptor, imageSrc);
                        setFeedback("Rosto capturado com sucesso!");
                    }
                }
            } else {
                setFeedback("Nenhum rosto detectado. Tente melhorar a iluminação.");
            }
        } catch (error) {
            console.error("Detection error:", error);
            setFeedback("Erro na detecção.");
        } finally {
            setDetecting(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center gap-4 p-4 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md w-full max-w-sm mx-auto">
            {!modelsLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 rounded-xl">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-400">Iniciando Neural Net...</p>
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden rounded-lg border-2 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="w-full h-auto object-cover"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Face Guide Overlay */}
                <div className="absolute inset-0 border-[3px] border-dashed border-white/20 rounded-full scale-75 opacity-50 pointer-events-none mx-12 my-8" />
            </div>

            <div className="text-center space-y-2 w-full">
                <p className={`text-sm font-medium ${feedback.includes('Erro') || feedback.includes('Nenhum') ? 'text-red-400' : 'text-green-400'}`}>
                    {feedback}
                </p>

                <Button
                    onClick={handleCapture}
                    disabled={!modelsLoaded || detecting}
                    className="w-full bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                >
                    {detecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Camera className="w-4 h-4 mr-2" />
                    )}
                    {mode === 'register' ? 'Registrar Rosto' : 'Verificar Identidade'}
                </Button>
            </div>
        </div>
    );
};
