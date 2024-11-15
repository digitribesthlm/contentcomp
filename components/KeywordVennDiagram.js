import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import * as venn from 'venn.js';

export default function KeywordVennDiagram({ data, selectedDomain, comparisonDomains }) {
  const vennRef = useRef();

  const vennData = useMemo(() => {
    if (!selectedDomain || comparisonDomains.length === 0) return [];

    // Get all keywords for the selected domain
    const selectedDomainPage = data.pages.find(p => p.website_info.domain === selectedDomain);
    const selectedKeywords = new Set([
      ...selectedDomainPage.content_analysis.primary_keywords,
      ...selectedDomainPage.content_analysis.supporting_keywords,
      ...Object.keys(selectedDomainPage.seo_metrics.keyword_density || {})
    ]);

    // Get all keywords for the comparison domain
    const comparisonDomainPage = data.pages.find(p => p.website_info.domain === comparisonDomains[0]);
    const comparisonKeywords = new Set([
      ...comparisonDomainPage.content_analysis.primary_keywords,
      ...comparisonDomainPage.content_analysis.supporting_keywords,
      ...Object.keys(comparisonDomainPage.seo_metrics.keyword_density || {})
    ]);

    // Calculate intersection
    const intersection = [...selectedKeywords].filter(x => comparisonKeywords.has(x));

    return [
      { 
        sets: [selectedDomain], 
        size: selectedKeywords.size,
        keywords: [...selectedKeywords],
        label: `${selectedDomain}\n(${selectedKeywords.size})`
      },
      { 
        sets: [comparisonDomains[0]], 
        size: comparisonKeywords.size,
        keywords: [...comparisonKeywords],
        label: `${comparisonDomains[0]}\n(${comparisonKeywords.size})`
      },
      { 
        sets: [selectedDomain, comparisonDomains[0]], 
        size: intersection.length,
        keywords: intersection,
        label: `${intersection.length} shared`
      }
    ];
  }, [data, selectedDomain, comparisonDomains]);

  useEffect(() => {
    if (!vennRef.current || vennData.length === 0) return;

    // Clear previous diagram
    d3.select(vennRef.current).selectAll("*").remove();

    // Adjust dimensions and margins
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the Venn diagram
    const div = d3.select(vennRef.current)
      .style('width', `${width + margin.left + margin.right}px`)
      .style('height', `${height + margin.top + margin.bottom}px`)
      .style('position', 'relative');

    const svg = div.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left + width/2},${margin.top + height/2})`);

    const chart = venn.VennDiagram()
      .width(width)
      .height(height);

    svg.datum(vennData).call(chart);

    // Style the circles
    div.selectAll('.venn-circle path')
      .style('fill-opacity', 0.2)
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.8)
      .style('stroke', (d, i) => i === 0 ? '#f000b8' : '#570df8')  // Swapped colors
      .style('fill', (d, i) => i === 0 ? '#f000b8' : '#570df8');   // Swapped colors

    // Improve text styling
    div.selectAll('.venn-circle text')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .style('text-anchor', 'middle')
      .each(function(d) {
        const text = d3.select(this);
        const lines = d.label.split('\n');
        text.text(''); // Clear existing text
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? 0 : '1.5em')
            .text(line);
        });
      });

    // Style intersection text
    div.selectAll('.venn-intersection text')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#000');

    // Create a tooltip div
    const tooltip = div.append('div')
      .attr('class', 'venn-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('box-shadow', '0 0 10px rgba(0,0,0,0.1)')
      .style('max-width', '200px')
      .style('z-index', '10');

    // Add hover effects with modern event handling
    div.selectAll('g')
      .on('mouseover', (event, d) => {
        // Highlight the current set
        d3.select(event.currentTarget)
          .select('path')
          .style('fill-opacity', 0.4)
          .style('stroke-width', 3);

        // Show tooltip
        tooltip.style('visibility', 'visible');
        
        // Update tooltip content
        tooltip.html('');
        tooltip.append('div')
          .style('font-weight', 'bold')
          .text(d.keywords ? `${d.keywords.length} Keywords:` : '');

        if (d.keywords) {
          const keywordList = tooltip.append('div')
            .style('max-height', '150px')
            .style('overflow-y', 'auto');

          d.keywords.slice(0, 10).forEach(keyword => {
            keywordList.append('p')
              .style('margin', '2px 0')
              .text(keyword);
          });

          if (d.keywords.length > 10) {
            tooltip.append('p')
              .style('font-style', 'italic')
              .text(`...and ${d.keywords.length - 10} more`);
          }
        }

        // Position tooltip
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const mouseX = event.pageX - vennRef.current.getBoundingClientRect().left;
        const mouseY = event.pageY - vennRef.current.getBoundingClientRect().top;

        tooltip
          .style('left', `${mouseX + 10}px`)
          .style('top', `${mouseY + 10}px`);
      })
      .on('mousemove', (event) => {
        const mouseX = event.pageX - vennRef.current.getBoundingClientRect().left;
        const mouseY = event.pageY - vennRef.current.getBoundingClientRect().top;

        tooltip
          .style('left', `${mouseX + 10}px`)
          .style('top', `${mouseY + 10}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .select('path')
          .style('fill-opacity', 0.2)
          .style('stroke-width', 2);
        
        tooltip.style('visibility', 'hidden');
      });

  }, [vennData]);

  if (!selectedDomain || comparisonDomains.length !== 1) {
    return (
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Select exactly one comparison domain to see the keyword overlap visualization</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl mb-6 p-4">
      <h2 className="text-xl font-bold mb-4">Keyword Overlap</h2>
      <div 
        ref={vennRef} 
        className="flex justify-center items-center min-h-[400px] bg-white rounded-lg"
      />
    </div>
  );
} 