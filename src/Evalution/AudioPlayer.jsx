import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { RotateCcw, RotateCw, Volume2 } from "react-feather";
 
const AudioPlayer = ({ call_id }) => {
  const SKIP_TIME = 5;
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const regions = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioURL, setAudioURL] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioMarkers, setAudioMarkers] = useState([]);
 
  // Function to convert time string (HH:MM:SS) to seconds
  const timeToSeconds = (timeString) => {
    const parts = timeString.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };
 
  // Fetch audio data and markers separately
  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        setIsLoading(true);
        setError(null);
 
        // Parallel API calls for audio and markers
        const [audioResponse, markersResponse] = await Promise.all([
          fetch("https://mersols.com/get-audio", {
            method: "POST",
            body: (() => {
              const formData = new FormData();
              formData.append("file_name", call_id);
              return formData;
            })(),
          }),
          fetch(`https://mersols.com/get-s3-uri/${call_id}`)
        ]);
 
        if (!audioResponse.ok) throw new Error("Failed to fetch audio");
        if (!markersResponse.ok) throw new Error("Failed to fetch markers");
 
        const audioBlob = await audioResponse.blob();
        const audioBlobUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioBlobUrl);
 
        const markersData = await markersResponse.json();
        const transformedMarkers = (markersData.Audio_Markers || []).map(marker => ({
          ...marker,
          time: timeToSeconds(marker.time),
          label: marker.label || marker.type
        }));
       
        setAudioMarkers(transformedMarkers);
 
      } catch (error) {
        console.error("Error fetching audio data:", error);
        setError("Failed to load audio. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
 
    if (call_id) {
      fetchAudioData();
    }
  }, [call_id]);
 
  // Initialize WaveSurfer and add markers
  useEffect(() => {
    if (!waveformRef.current || !audioURL) return;
 
    setError(null);
 
    if (wavesurfer.current) {
      wavesurfer.current.unAll();
      wavesurfer.current.destroy();
    }
 
    regions.current = RegionsPlugin.create();
 
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ffffff",
      progressColor: "#4a90e2",
      barWidth: 6,
      barGap: 4,
      barRadius: 12,
      interact: true,
      responsive: true,
      cursorWidth: 2,
      cursorColor: "#333",
      height: 150,
      backend: "MediaElement",
      plugins: [regions.current],
    });
 
    wavesurfer.current.load(audioURL);
 
    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
      setIsLoading(false);
      addMarkersToWaveform();
    });
 
    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });
 
    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));
 
    wavesurfer.current.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      setError("Error loading audio file. Please check the URL.");
      setIsLoading(false);
    });
 
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.unAll();
        wavesurfer.current.destroy();
      }
    };
  }, [audioURL]);
 
  // Function to add markers to the waveform with proper positioning
  const addMarkersToWaveform = () => {
    if (!wavesurfer.current || !regions.current || audioMarkers.length === 0) return;
 
    regions.current.clearRegions();
 
    audioMarkers.forEach((marker, index) => {
      const regionColor = getMarkerColor(marker.type);
     
      // Calculate position - alternate between top and bottom
      const position = index % 2 === 0 ? 'top' : 'bottom';
     
      const region = regions.current.addRegion({
        start: marker.time,
        end: marker.time + 0.1,
        color: regionColor,
        drag: false,
        resize: false,
        content: createMarkerContent(marker, position),
      });
 
      // Style the region with proper positioning
      region.element.style.borderLeft = `3px solid ${regionColor.replace('0.4', '1')}`;
      region.element.style.backgroundColor = 'transparent';
      region.element.style.borderRadius = '0px';
      region.element.style.zIndex = '10';
      region.element.style.height = '40px'; // Fixed height for all markers
      region.element.style.display = 'flex';
      region.element.style.alignItems = position === 'top' ? 'flex-start' : 'flex-end';
      region.element.style.justifyContent = 'flex-start';
      region.element.style.pointerEvents = 'auto';
      region.element.style.overflow = 'visible';
     
      // Position the region container properly
      if (position === 'top') {
        region.element.style.top = '10px';
        region.element.style.bottom = 'auto';
      } else {
        region.element.style.top = 'auto';
        region.element.style.bottom = '10px';
      }
 
      // Add click handler
      region.on('click', (e) => {
        e.stopPropagation();
        wavesurfer.current.setTime(marker.time);
        setCurrentTime(marker.time);
      });
 
      // Add hover effects
      region.on('mouseenter', () => {
        region.element.style.opacity = '1';
        const markerPoint = region.element.querySelector('.marker-point');
        const markerLabel = region.element.querySelector('.marker-label');
        if (markerPoint) {
          markerPoint.style.transform = 'scale(1.3)';
        }
        if (markerLabel) {
          markerLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          markerLabel.style.fontSize = '11px';
          markerLabel.style.padding = '4px 8px';
        }
      });
 
      region.on('mouseleave', () => {
        region.element.style.opacity = '0.9';
        const markerPoint = region.element.querySelector('.marker-point');
        const markerLabel = region.element.querySelector('.marker-label');
        if (markerPoint) {
          markerPoint.style.transform = 'scale(1)';
        }
        if (markerLabel) {
          markerLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          markerLabel.style.fontSize = '10px';
          markerLabel.style.padding = '3px 6px';
        }
      });
    });
  };
 
  // Function to create marker content with larger size
  const createMarkerContent = (marker, position) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'marker-container';
    markerDiv.style.position = 'relative';
    markerDiv.style.display = 'flex';
    markerDiv.style.flexDirection = 'column';
    markerDiv.style.alignItems = 'flex-start';
    markerDiv.style.gap = '1px';
    markerDiv.style.paddingLeft = '1px';
    markerDiv.style.cursor = 'pointer';
    markerDiv.style.height = '100%';
    markerDiv.style.justifyContent = position === 'top' ? 'flex-start' : 'flex-end';
 
    if (position === 'top') {
      // For top markers: label above point
      const label = createMarkerLabel(marker);
      const markerPoint = createMarkerPoint(marker);
      markerDiv.appendChild(label);
      markerDiv.appendChild(markerPoint);
    } else {
      // For bottom markers: point above label
      const markerPoint = createMarkerPoint(marker);
      const label = createMarkerLabel(marker);
      markerDiv.appendChild(markerPoint);
      markerDiv.appendChild(label);
    }
 
    return markerDiv;
  };
 
  const createMarkerPoint = (marker) => {
    const markerPoint = document.createElement('div');
    markerPoint.className = 'marker-point';
    markerPoint.style.width = '14px';
    markerPoint.style.height = '14px';
    markerPoint.style.borderRadius = '50%';
    markerPoint.style.backgroundColor = getMarkerColor(marker.type).replace('0.4', '1');
    markerPoint.style.border = '2px solid white';
    markerPoint.style.boxShadow = '0 2px 4px rgba(0,0,0,0.4)';
    markerPoint.style.zIndex = '11';
    markerPoint.style.flexShrink = '0';
    markerPoint.style.transition = 'transform 0.2s ease';
    return markerPoint;
  };
 
  const createMarkerLabel = (marker) => {
    const label = document.createElement('div');
    label.className = 'marker-label';
    label.style.color = 'white';
    label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    label.style.padding = '3px 6px';
    label.style.borderRadius = '8px';
    label.style.fontSize = '10px';
    label.style.fontWeight = '600';
    label.style.whiteSpace = 'nowrap';
    label.style.zIndex = '12';
    label.style.textShadow = '0 1px 2px rgba(0,0,0,0.6)';
    label.style.pointerEvents = 'none';
    label.style.transition = 'all 0.2s ease';
    label.style.border = '1px solid rgba(255,255,255,0.4)';
    label.style.maxWidth = '120px';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';
    label.style.lineHeight = '1.3';
    label.textContent = marker.label;
    return label;
  };
 
  // Helper function to get color based on marker type
// Helper function to get color based on marker type
const getMarkerColor = (type) => {
  const colors = {
    // Initial contact markers
    greeting: "rgba(33, 150, 243, 0.8)",        // Blue
    qualification_check: "rgba(156, 39, 176, 0.8)", // Purple
    eligibility_check: "rgba(103, 58, 183, 0.8)",   // Deep Purple
   
    // Information sharing markers
    seminar_invitation: "rgba(0, 150, 136, 0.8)",  // Teal
    course_information: "rgba(0, 150, 136, 0.8)",  // Teal
    career_guidance: "rgba(0, 150, 136, 0.8)",     // Teal
   
    // Process markers
    seat_confirmation: "rgba(255, 152, 0, 0.8)",   // Orange
    centre_location: "rgba(255, 193, 7, 0.8)",     // Amber
    document_verification: "rgba(121, 85, 72, 0.8)", // Brown
   
    // Communication markers
    phone_number_sharing: "rgba(233, 30, 99, 0.8)", // Pink
    fee_discussion: "rgba(244, 67, 54, 0.8)",      // Red
    objection_handling: "rgba(230, 81, 0, 0.8)",   // Deep Orange
   
    // Follow-up markers
    follow_up: "rgba(158, 158, 158, 0.8)",         // Gray
    closing: "rgba(76, 175, 80, 0.8)",             // Green
   
    // Default fallbacks
    start: "rgba(76, 175, 80, 0.8)",               // Green
    end: "rgba(244, 67, 54, 0.8)",                 // Red
    information: "rgba(33, 150, 243, 0.8)",        // Blue
    qualification: "rgba(156, 39, 176, 0.8)",      // Purple
    action: "rgba(103, 58, 183, 0.8)",             // Deep Purple
  };
 
  return colors[type] || "rgba(158, 158, 158, 0.8)"; // Default gray
};
  // Get marker label for current time
  const getCurrentMarker = () => {
    const currentMarker = audioMarkers.find(marker =>
      Math.abs(currentTime - marker.time) < 2
    );
   
    if (!currentMarker) {
      const pastMarkers = audioMarkers.filter(marker => marker.time <= currentTime);
      return pastMarkers[pastMarkers.length - 1];
    }
   
    return currentMarker;
  };
 
  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
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
      const newTime = Math.min(
        wavesurfer.current.getCurrentTime() + SKIP_TIME,
        duration
      );
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
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };
 
  const jumpToMarker = (time) => {
    if (wavesurfer.current) {
      wavesurfer.current.setTime(time);
      setCurrentTime(time);
     
      if (isPlaying) {
        wavesurfer.current.play();
      }
    }
  };
 
  return (
    <section className="bg-white px-6 py-4 rounded-xl w-[78%] ml-[17rem] mt-10">
      {/* Waveform Container */}
      <div
        ref={waveformRef}
        className="w-full bg-blue-100 rounded-md py-4 mb-4 px-4 relative h-44"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50">
            <div className="flex flex-col items-center">
              <div className="flex space-x-1 mb-2">
                <div className="w-2 h-6 bg-blue-500 animate-[bounce_0.6s_infinite_alternate]"></div>
                <div className="w-2 h-8 bg-blue-500 animate-[bounce_0.6s_0.2s_infinite_alternate]"></div>
                <div className="w-2 h-4 bg-blue-500 animate-[bounce_0.6s_0.4s_infinite_alternate]"></div>
              </div>
              <p className="text-blue-600 text-sm">Loading audio and markers...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}
      </div>
 
      {/* Current Marker Display */}
      {audioMarkers.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current Segment:</span>
            <span className="text-sm font-semibold text-blue-600">
              {getCurrentMarker()?.label || "No active segment"}
            </span>
            <span className="text-xs text-gray-500">
              {getCurrentMarker() ? formatTime(getCurrentMarker().time) : ""}
            </span>
          </div>
        </div>
      )}
 
      {/* SIMPLE CONTROLS - No complex styling */}
      <div className="flex items-center justify-between mt-2 mb-2 p-2 bg-white border border-gray-200 rounded-lg">
       
        {/* Play/Pause Button - Big and Clear */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={togglePlayPause}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg shadow-lg"
            disabled={isLoading || error}
          >
            {isLoading ? "Loading..." : isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>
        </div>
 
        {/* Timeline Controls - With proper spacing */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <button
            onClick={handleRewind}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={isLoading || error}
          >
            <RotateCcw size={24} />
          </button>
 
          <div className="bg-white border border-gray-300 px-4 py-2 rounded-lg min-w-[140px] text-center">
            <span className="text-lg font-mono font-bold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
 
          <button
            onClick={handleForward}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={isLoading || error}
          >
            <RotateCw size={24} />
          </button>
        </div>
 
        {/* Volume Controls - Simple and clean */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            disabled={isLoading || error}
          >
            <Volume2 size={24} />
          </button>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 h-2 bg-gray-200 rounded-lg accent-blue-600 cursor-pointer"
              disabled={isLoading || error}
            />
            <span className="text-sm font-medium w-12">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
 
         {/* Custom CSS for markers */}
      <style jsx>{`
        /* Ensure markers are visible above waveform */
        :global([data-resize] .marker-point) {
          z-index: 11;
        }
       
        :global([data-resize] .marker-label) {
          z-index: 12;
        }
       
        /* Improve marker visibility */
        :global(.marker-container) {
          pointer-events: auto !important;
        }
       
        /* Prevent waveform clicks from interfering with markers */
        :global(wavesurfer-region) {
          pointer-events: auto !important;
        }
       
        /* Ensure regions are properly positioned */
        :global(wavesurfer-region) {
          overflow: visible !important;
        }
      `}</style>
    </section>
  );
};
 
export default AudioPlayer;
 