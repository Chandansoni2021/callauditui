import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { RotateCcw, RotateCw, Volume2 } from "react-feather";

const AudioPlayer = ({ call_id }) => {
  const SKIP_TIME = 5;
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioURL, setAudioURL] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioURL = async () => {
  try {
    const formData = new FormData();
    formData.append("file_name", call_id);

    const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-audio", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to fetch audio");

    // Create a blob URL from the response
    const blob = await response.blob();
    const audioBlobUrl = URL.createObjectURL(blob);
    setAudioURL(audioBlobUrl);
  } catch (error) {
    console.error("Error fetching audio:", error);
    setError("Failed to load audio. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
    if (call_id) {
      fetchAudioURL();
    }
  }, [call_id]);

  useEffect(() => {
    if (!waveformRef.current || !audioURL) return;

    setIsLoading(true);
    setError(null);

    // Destroy previous instance if exists
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ffffff",
      progressColor: "#4a90e2",
      barWidth: 6,
      barGap: 4,
      barRadius: 12,
      interact: true,
      responsive: true,
      cursorWidth: 0,
      height: 150,
      backend: "MediaElement",
    });

    wavesurfer.current.load(audioURL);

    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
      setIsLoading(false);
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      setError("Error loading audio file. Please check the URL.");
      setIsLoading(false);
    });

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioURL]);

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
    }
  };

  const handleRewind = () => {
    if (wavesurfer.current) {
      const newTime = Math.max(0, wavesurfer.current.getCurrentTime() - SKIP_TIME);
      wavesurfer.current.setTime(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleForward = () => {
    if (wavesurfer.current) {
      const newTime = Math.min(wavesurfer.current.getCurrentTime() + SKIP_TIME, duration);
      wavesurfer.current.setTime(newTime);
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!wavesurfer.current) return;
    setVolume((prevVolume) => {
      const newVolume = prevVolume > 0 ? 0 : 1;
      wavesurfer.current.setVolume(newVolume);
      return newVolume;
    });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="bg-white px-6 py-4 rounded-xl w-[78%] ml-[17rem] mt-10">
      {/* Waveform Container */}
      <div ref={waveformRef} className="w-full bg-blue-100 rounded-md py-4 mb-4 px-4 relative h-44">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50">
            <div className="flex space-x-1">
              <div className="w-2 h-6 bg-blue-500 animate-[bounce_0.6s_infinite_alternate]"></div>
              <div className="w-2 h-8 bg-blue-500 animate-[bounce_0.6s_0.2s_infinite_alternate]"></div>
              <div className="w-2 h-4 bg-blue-500 animate-[bounce_0.6s_0.4s_infinite_alternate]"></div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center mt-4 mb-14 gap-10">
        <button
          onClick={togglePlayPause}
          className="cursor-pointer px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-500 transition"
          disabled={isLoading || error}
        >
          {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
        </button>

        <div className="flex items-center gap-x-4">
          <button onClick={handleRewind} className="cursor-pointer text-gray-700 hover:text-blue-500" disabled={isLoading || error}>
            <RotateCcw size={20} />
          </button>

          <span className="text-xl border border-gray-300 px-3 py-1 rounded-md">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button onClick={handleForward} className="cursor-pointer text-gray-700 hover:text-blue-500" disabled={isLoading || error}>
            <RotateCw size={20} />
          </button>
        </div>

        <div className="flex items-center gap-x-4 ml-1">
          <button onClick={toggleMute} className="cursor-pointer text-gray-700 hover:text-blue-500" disabled={isLoading || error}>
            <Volume2 size={20} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-30 cursor-pointer h-1.5 accent-blue-500"
            aria-label="Volume control"
            disabled={isLoading || error}
          />
        </div>
      </div>
    </section>
  );
};

export default AudioPlayer;