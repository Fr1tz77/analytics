'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function D3Chart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous chart

      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      g.append("g")
        .call(d3.axisLeft(y));

      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "steelblue");

      // Add labels
      g.append("text")
        .attr("transform", `translate(${width/2},${height + margin.bottom - 5})`)
        .style("text-anchor", "middle")
        .text("Pages");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Page Views");
    }
  }, [data]);

  return <svg ref={svgRef} width="400" height="300"></svg>;
}