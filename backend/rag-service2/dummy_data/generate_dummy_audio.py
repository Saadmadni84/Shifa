"""
dummy_data/generate_dummy_audio.py

Generates a realistic doctor-patient consultation audio file using Google TTS.
Produces actual spoken dialogue that can be transcribed by the ingestion pipeline.

Creates:
1. sample_consultation.mp3 — Primary spoken audio (gTTS output)
2. sample_consultation.wav — WAV conversion for broader compatibility

Usage:
    python dummy_data/generate_dummy_audio.py
"""

import os
import io
import wave
import struct
import math
import tempfile

# Doctor-Patient Consultation Script (realistic medical dialogue)
CONSULTATION_SCRIPT = """
Good morning Mr. Patel. Please have a seat. How are you feeling today?

I have been feeling quite unwell for the past ten days Doctor. I have this persistent cough that just will not go away. I have been running a low fever on and off.

Can you describe the cough for me? Is it dry or productive?

It is productive. I am coughing up yellowish green mucus, especially in the mornings. The cough gets worse at night. I also feel short of breath when I climb stairs.

Given your history of childhood asthma, have you been using your rescue inhaler more frequently?

Yes definitely. Normally I only use the Albuterol inhaler once or twice a week, but for the past two weeks I have been needing it four or five times a day.

Let me check your vitals. Your blood pressure is 128 over 82, which is normal. Heart rate is 92 beats per minute. Temperature is 100.2 degrees Fahrenheit, confirming the low grade fever. Oxygen saturation is 96 percent.

Your lab results show your white blood cell count is elevated at 12800, which suggests an active infection. Your CRP is also elevated at 18.5 milligrams per liter.

Based on the elevated WBC, high CRP, and your chest X-ray findings, I am diagnosing you with acute bronchitis with a secondary asthma exacerbation.

I am prescribing Amoxicillin 500 milligrams three times daily for seven days. Azithromycin 500 milligrams once daily for three days. Montelukast 10 milligrams at bedtime for thirty days. Continue using your Albuterol inhaler as needed. Guaifenesin syrup 10 milliliters three times daily. And Paracetamol 500 milligrams every six hours as needed for fever.

Please increase your fluid intake to at least two and a half liters per day. Avoid cold beverages. Stick to light warm meals.

I would like to see you for a follow-up on August 4th. If you experience high fever above 102 degrees, severe difficulty breathing, or chest pain, please come to the emergency department immediately.

Thank you Doctor Mehta. I appreciate your thoroughness.
""".strip()


def generate_real_audio(output_dir: str = None):
    """Generates actual spoken audio using Google Text-to-Speech (gTTS)."""
    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(__file__))

    mp3_path = os.path.join(output_dir, "sample_consultation.mp3")
    wav_path = os.path.join(output_dir, "sample_consultation.wav")

    try:
        from gtts import gTTS

        print("[INFO] Generating spoken audio using Google TTS...")
        tts = gTTS(text=CONSULTATION_SCRIPT, lang="en", slow=False)
        tts.save(mp3_path)
        print(f"[SUCCESS] Generated MP3: {mp3_path} ({os.path.getsize(mp3_path):,} bytes)")

        # Convert MP3 to WAV using pydub (if ffmpeg available) or keep MP3
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(mp3_path)
            audio = audio.set_frame_rate(44100).set_channels(1).set_sample_width(2)
            audio.export(wav_path, format="wav")
            print(f"[SUCCESS] Generated WAV: {wav_path} ({os.path.getsize(wav_path):,} bytes)")
        except Exception as e:
            print(f"[WARNING] WAV conversion failed ({e}). MP3 file is still valid for testing.")
            # Generate a basic WAV as fallback
            _generate_fallback_wav(wav_path)

        return mp3_path, wav_path

    except ImportError:
        print("[WARNING] gTTS not installed. Generating fallback tone WAV.")
        _generate_fallback_wav(wav_path)
        return None, wav_path
    except Exception as e:
        print(f"[WARNING] gTTS failed ({e}). Generating fallback WAV.")
        _generate_fallback_wav(wav_path)
        return None, wav_path


def _generate_fallback_wav(output_path: str, duration_seconds: float = 5.0):
    """Generates a simple WAV file with tone patterns (fallback if TTS unavailable)."""
    sample_rate = 44100
    total_samples = int(sample_rate * duration_seconds)

    samples = []
    for i in range(total_samples):
        t = i / sample_rate
        freq1 = 200 + 100 * math.sin(2 * math.pi * 0.5 * t)
        freq2 = 400 + 50 * math.sin(2 * math.pi * 1.0 * t)
        amplitude = 0.3 * (1 + 0.5 * math.sin(2 * math.pi * 2.0 * t))

        sample = amplitude * (
            0.6 * math.sin(2 * math.pi * freq1 * t) +
            0.3 * math.sin(2 * math.pi * freq2 * t) +
            0.1 * math.sin(2 * math.pi * 800 * t)
        )
        sample_int = max(-32767, min(32767, int(sample * 32767)))
        samples.append(sample_int)

    with wave.open(output_path, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(struct.pack(f'<{len(samples)}h', *samples))

    print(f"[SUCCESS] Generated fallback WAV: {output_path} ({os.path.getsize(output_path):,} bytes)")


def generate_dummy_wav_bytes(duration_seconds: float = 2.0) -> bytes:
    """Generates WAV audio bytes in memory (for use in tests)."""
    sample_rate = 44100
    total_samples = int(sample_rate * duration_seconds)

    samples = []
    for i in range(total_samples):
        t = i / sample_rate
        sample = int(5000 * math.sin(2 * math.pi * 440 * t))
        samples.append(max(-32767, min(32767, sample)))

    wav_buf = io.BytesIO()
    with wave.open(wav_buf, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(struct.pack(f'<{len(samples)}h', *samples))

    return wav_buf.getvalue()


if __name__ == "__main__":
    generate_real_audio()
    print(f"\n[INFO] Associated transcript: dummy_data/sample_transcript.txt")
