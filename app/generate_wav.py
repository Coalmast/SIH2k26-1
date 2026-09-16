import wave
import struct
import math
import os

filepath = r"m:\SIH\main\app\android\app\src\main\res\raw\comet_alarm.wav"
os.makedirs(os.path.dirname(filepath), exist_ok=True)

sample_rate = 44100
duration = 1.0 # seconds
freq = 440.0 # Hz

with wave.open(filepath, 'w') as wav_file:
    wav_file.setnchannels(1) # mono
    wav_file.setsampwidth(2) # 2 bytes per sample
    wav_file.setframerate(sample_rate)
    
    for i in range(int(sample_rate * duration)):
        value = int(32767.0 * math.sin(2.0 * math.pi * freq * i / sample_rate))
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)
print(f"Generated {filepath}")
