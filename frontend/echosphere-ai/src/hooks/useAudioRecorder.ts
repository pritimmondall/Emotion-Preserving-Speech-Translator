import { useState, useRef, useCallback, useEffect } from 'react';
import { websocketService, TranscriptionResult } from '@/services/websocket';

export interface UseAudioRecorderOptions {
  onTranscription?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
  recordingDuration?: number; // Duration of each recording segment in ms
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isConnected: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: Error | null;
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn => {
  const { onTranscription, onError, recordingDuration = 3000 } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);

  // Setup WebSocket connection and callbacks
  useEffect(() => {
    websocketService.onMessage((result) => {
      onTranscription?.(result);
    });

    websocketService.onConnect(() => {
      setIsConnected(true);
      setError(null);
    });

    websocketService.onDisconnect(() => {
      setIsConnected(false);
    });

    websocketService.onError(() => {
      const err = new Error('WebSocket connection error');
      setError(err);
      onError?.(err);
    });

    return () => {
      websocketService.disconnect();
    };
  }, [onTranscription, onError]);

  // Function to record a single segment and send it
  const recordAndSendSegment = useCallback(async (stream: MediaStream): Promise<void> => {
    return new Promise((resolve) => {
      const chunks: Blob[] = [];
      
      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          if (audioBlob.size > 1000 && websocketService.isConnected()) {
            console.log(`Sending complete audio segment: ${audioBlob.size} bytes`);
            websocketService.sendAudioBlob(audioBlob);
          }
        }
        resolve();
      };

      mediaRecorder.onerror = () => {
        console.error('MediaRecorder error');
        resolve();
      };

      // Start recording
      mediaRecorder.start();

      // Stop after the specified duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          resolve();
        }
      }, recordingDuration);
    });
  }, [recordingDuration]);

  // Recording loop - records segments continuously
  const startRecordingLoop = useCallback(async (stream: MediaStream) => {
    while (isRecordingRef.current && stream.active) {
      await recordAndSendSegment(stream);
      // Small delay between segments
      if (isRecordingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [recordAndSendSegment]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Connect to WebSocket if not connected
      if (!websocketService.isConnected()) {
        await websocketService.connect();
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);

      console.log('Recording started');

      // Start the recording loop (non-blocking)
      startRecordingLoop(stream);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      console.error('Failed to start recording:', error);
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [startRecordingLoop, onError]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    // Stop the MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    console.log('Recording stopped');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      websocketService.disconnect();
    };
  }, []);

  return {
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    error,
  };
};

export default useAudioRecorder;
