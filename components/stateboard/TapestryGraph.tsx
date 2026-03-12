import React, { useState, useEffect, useRef } from 'react';
import { Share2, Maximize2, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { TapestryGraph as TapestryGraphType } from '../../types';
import * as d3 from 'd3';
import { createPortal } from 'react-dom';

interface TapestryGraphProps {
  graph: TapestryGraphType;
}

const TapestryGraph: React.FC<TapestryGraphProps> = ({ graph }) => {
  const [showTapestry, setShowTapestry] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const modalSvgRef = useRef<SVGSVGElement>(null);

  // Helper to render the D3 graph
  const renderGraph = (svgElement: SVGSVGElement, width: number, height: number, interactive: boolean = false) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return;

    // Clone data to prevent D3 from mutating props and filter invalid edges
    const nodes = graph.nodes.map(d => ({ ...d }));
    const nodeIds = new Set(nodes.map(d => d.id));
    const edges = (graph.edges || [])
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(d => ({ ...d }));

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("class", "graph-content");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(interactive ? 100 : 50))
      .force("charge", d3.forceManyBody().strength(interactive ? -300 : -100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(interactive ? 40 : 20));

    // Arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#475569")
      .style("stroke", "none");

    const link = g.append("g")
      .selectAll("line")
      .data(edges)
      .enter().append("line")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => ((d as any).weight || 0.5) * 2)
      .attr("marker-end", "url(#arrowhead)");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", d => (interactive ? 8 : 5) + ((d as any).weight || 0.5) * (interactive ? 10 : 5))
      .attr("fill", d => {
        switch (nodeTypeToColor((d as any).type)) {
          case 'blue': return '#3b82f6';
          case 'emerald': return '#10b981';
          case 'amber': return '#f59e0b';
          case 'purple': return '#a855f7';
          case 'rose': return '#f43f5e';
          default: return '#64748b';
        }
      })
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.5);

    node.append("text")
      .attr("dx", interactive ? 15 : 10)
      .attr("dy", ".35em")
      .text(d => (d as any).id)
      .attr("fill", "#94a3b8")
      .attr("font-size", interactive ? "12px" : "8px")
      .attr("font-family", "monospace")
      .attr("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    if (interactive) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom);
      
      // Initial zoom/center
      svg.call(zoom.transform, d3.zoomIdentity);

      // Expose zoom functions for buttons
      (svgElement as any).zoomIn = () => svg.transition().call(zoom.scaleBy, 1.3);
      (svgElement as any).zoomOut = () => svg.transition().call(zoom.scaleBy, 1/1.3);
      (svgElement as any).resetZoom = () => svg.transition().call(zoom.transform, d3.zoomIdentity);
    }

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function nodeTypeToColor(type: string) {
      if (type === 'entity') return 'blue';
      if (type === 'location') return 'emerald';
      if (type === 'psychological') return 'rose';
      if (type === 'item') return 'amber';
      if (type === 'concept') return 'purple';
      return 'slate';
    }

    return simulation;
  };

  useEffect(() => {
    if (!showTapestry || !svgRef.current) return;
    const sim = renderGraph(svgRef.current, 280, 200, false);
    return () => sim?.stop();
  }, [graph, showTapestry]);

  useEffect(() => {
    if (!isModalOpen || !modalSvgRef.current) return;
    const sim = renderGraph(modalSvgRef.current, window.innerWidth, window.innerHeight, true);
    return () => sim?.stop();
  }, [graph, isModalOpen]);

  return (
    <section>
      <div className="flex justify-between items-center text-slate-500 mb-2 uppercase tracking-wider font-bold">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-slate-300" 
          onClick={() => setShowTapestry(!showTapestry)}
        >
          <Share2 size={14} /> The Tapestry
          <span className="text-[10px]">{showTapestry ? '▼' : '▶'}</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-slate-500 hover:text-blue-400 transition-colors"
          title="Explore Knowledge Graph"
        >
          <Maximize2 size={14} />
        </button>
      </div>
      
      {showTapestry && (
        <div 
          className="bg-slate-950 border border-slate-800 rounded overflow-hidden relative h-[200px] cursor-pointer hover:border-slate-700 transition-colors group"
          onClick={() => setIsModalOpen(true)}
        >
          <svg 
            ref={svgRef} 
            className="w-full h-full"
            viewBox="0 0 280 200"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Click to Explore Map</span>
          </div>

          {(!graph.nodes || graph.nodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 italic">
              The weave is empty.
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 pointer-events-none">
             <div className="flex items-center gap-1 text-[8px] uppercase text-slate-500">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Entity
             </div>
             <div className="flex items-center gap-1 text-[8px] uppercase text-slate-500">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Location
             </div>
             <div className="flex items-center gap-1 text-[8px] uppercase text-slate-500">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Psych
             </div>
          </div>
        </div>
      )}

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full h-full flex flex-col">
            
            {/* Header / Controls */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-serif text-slate-100 tracking-tight">The Tapestry</h2>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Knowledge Graph & Quest Map</p>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 p-1 rounded-lg backdrop-blur-sm">
                <button 
                  onClick={() => (modalSvgRef.current as any)?.zoomIn()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button 
                  onClick={() => (modalSvgRef.current as any)?.zoomOut()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button 
                  onClick={() => (modalSvgRef.current as any)?.resetZoom()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Reset View"
                >
                  <Move size={18} />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 border border-slate-700 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Map Legend</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Entity
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Location
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div> Psychology
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> Item
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div> Concept
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-10 p-3 bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-900/20 hover:border-red-900/50 rounded-full transition-all backdrop-blur-sm group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* SVG Canvas */}
            <svg 
              ref={modalSvgRef} 
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
            
            {/* Background Grid Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ 
              backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}></div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default TapestryGraph;
