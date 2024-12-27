import React, { useState, useEffect, useRef } from 'react';

export const TimeSlider = ({ value, onChange }) => {
  const [angle, setAngle] = useState(0); // Store the angle of the slider
  const [isDragging, setIsDragging] = useState(false);
  const circleRef = useRef(null);
  const knobRef = useRef(null);

  useEffect(() => {
    const initialAngle = (value % 12) * 30; // Convert the value to an angle (30° per hour)
    setAngle(initialAngle);
  }, [value]);

  const getMouseAngle = (e) => {
    const rect = circleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const angle = getMouseAngle(e);
    setAngle(angle);
    onChange(angle);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const angle = getMouseAngle(e);
      setAngle(angle);
      onChange(angle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getHourAndMinute = () => {
    const hours = Math.floor((angle + 90) / 30) % 12; // 360°/12 = 30°
    const minutes = Math.round(((angle % 30) / 30) * 60); // 30° = 60 minutes
    return { hours, minutes };
  };

  const updateKnobPosition = () => {
    const knobAngle = angle - 90; // Adjust for initial offset
    return `rotate(${knobAngle}deg)`;
  };

  return (
    <div
      ref={circleRef}
      className="relative flex items-center justify-center"
      style={{ width: '200px', height: '200px', borderRadius: '50%', border: '2px solid #ccc' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={knobRef}
        className="absolute bg-blue-500 rounded-full"
        style={{
          width: '20px',
          height: '20px',
          top: '50%',
          left: '50%',
          transformOrigin: 'center',
          transform: updateKnobPosition(),
        }}
      ></div>
      {/* Display hour and minute */}
      <div className="absolute text-center text-xl">
        {getHourAndMinute().hours}:{getHourAndMinute().minutes < 10 ? '0' : ''}
        {getHourAndMinute().minutes}
      </div>
    </div>
  );
};


