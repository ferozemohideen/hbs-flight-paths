"use client";

import { motion } from "framer-motion";
import { GeoProjection } from "d3-geo";
import { useEffect, useRef } from "react";

interface City {
  name: string;
  lat: number;
  lon: number;
}

interface FlightPathProps {
  route: City[];
  projection: GeoProjection;
  delay: number;
}

export default function FlightPath({
  route,
  projection,
  delay,
}: FlightPathProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const generatePathSegments = () => {
    const segments = [];
    for (let i = 0; i < route.length - 1; i++) {
      const start = projection([route[i].lon, route[i].lat]) || [0, 0];
      const end = projection([route[i + 1].lon, route[i + 1].lat]) || [0, 0];
      const midX = (start[0] + end[0]) / 2;
      const midY = Math.min(start[1], end[1]) - 50;

      segments.push({
        d: `M ${start[0]},${start[1]} Q ${midX},${midY} ${end[0]},${end[1]}`,
        startCity: route[i],
        endCity: route[i + 1],
        startPoint: start,
        endPoint: end,
      });
    }
    return segments;
  };

  const pathSegments = generatePathSegments();

  useEffect(() => {
    pathRefs.current.forEach((path, index) => {
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        setTimeout(() => {
          path.style.transition = `stroke-dashoffset 3s linear`;
          path.style.strokeDashoffset = "0";
        }, (delay + index * 3) * 1000);
      }
    });
  }, [delay]);

  return (
    <motion.g>
      {pathSegments.map((segment, index) => (
        <motion.g key={index}>
          <path
            ref={(el) => (pathRefs.current[index] = el)}
            d={segment.d}
            stroke="white"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
          />
          <motion.circle
            r="3"
            fill="white"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 3,
              delay: delay + index * 3,
              times: [0, 0.1, 1],
              ease: "linear",
            }}
          >
            <animateMotion
              dur="3s"
              begin={`${delay + index * 3}s`}
              fill="freeze"
              path={segment.d}
            />
          </motion.circle>
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: delay + (index + 1) * 3,
            }}
          >
            <text
              x={segment.endPoint[0]}
              y={segment.endPoint[1] - 10}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              filter="url(#glow)"
              fontWeight="bold"
            >
              {segment.endCity.name}
            </text>
          </motion.g>
        </motion.g>
      ))}
      {pathSegments.length > 0 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay,
          }}
        >
          <text
            x={pathSegments[0].startPoint[0]}
            y={pathSegments[0].startPoint[1] - 10}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            filter="url(#glow)"
            fontWeight="bold"
          >
            {pathSegments[0].startCity.name}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}
