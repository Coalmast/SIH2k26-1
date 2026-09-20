import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder, AudioModule, RecordingOptions } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { analyzeGrievanceAudio, GrievanceAnalysis } from '../lib/geminiAudioService';

export type VoiceGrievanceState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export function useVoiceGrievance() {
  const [state, setState] = useState<VoiceGrievanceState>('idle');
  const [result, setResult] = useState<GrievanceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // High quality recording options
  const recordingOptions: RecordingOptions = {
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  };
  
  const recorder = useAudioRecorder(recordingOptions);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setResult(null);
      setState('recording');
      setRecordingDuration(0);

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission is required to record grievances.');
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording', err);
      setError(err.message || 'Failed to start recording');
      setState('error');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setState('processing');
      
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        throw new Error('No audio file was created');
      }

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to Gemini
      const analysisResult = await analyzeGrievanceAudio(base64Audio, 'audio/m4a');
      setResult(analysisResult);
      setState('done');

    } catch (err: any) {
      console.error('Failed to process recording', err);
      setError(err.message || 'Failed to process recording');
      setState('error');
    }
  };

  const reset = () => {
    if (recorder.isRecording) {
      recorder.stop().catch(console.error);
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setResult(null);
    setError(null);
    setRecordingDuration(0);
    setState('idle');
  };

  return {
    state,
    recordingDuration,
    result,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
