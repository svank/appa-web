import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import Tippy, {sticky} from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import {ScreenFullIcon, ScreenNormalIcon} from "@primer/octicons-react";
import {FullScreen, useFullScreenHandle} from "react-full-screen";
import {sortChains} from "./ResultDisplay";
import {ADSUrl} from "./Util";
import './Graph.css';

cytoscape.use(popper);

function Graph(props) {
    const fullScreenHandle = useFullScreenHandle();
    
    return (
        <div>
            <FullScreen handle={fullScreenHandle}>
                <GraphInner {...props}
                    fullScreenHandle={fullScreenHandle}
                />
            </FullScreen>
            
            <div className="result-display-footer text-muted">
                Generated with {}
                <a target="_blank" rel="noopener noreferrer"
                   href="https://github.com/plotly/react-cytoscapejs">
                    react-cytoscapejs
                </a> and {}
                <a target="_blank" rel="noopener noreferrer"
                   href="https://github.com/cytoscape/cytoscape.js">
                    cytoscape.js
                </a>.
            </div>
        </div>
    );
}

class GraphInner extends React.Component {
    constructor(props) {
        super(props);
        this.buildData = this.buildData.bind(this);
        this.onCyRefSet = this.onCyRefSet.bind(this);
    }
    
    onCyRefSet(cy) {
        if (this.cy || cy.container().clientWidth === 0)
            return;
        
        this.cy = cy;
        this.oldWidth = this.cy.container().clientWidth;
        this.oldHeight = this.cy.container().clientHeight;
        
        const [elements, zoom, pan] = this.buildData(
            cy.container().clientWidth,
            cy.container().clientHeight);
        
        cy.add(elements);
        cy.pan(pan);
        cy.zoom(zoom);
        
        cy.$('node').on('mouseover', (e) => {
            const sel = e.target;
            sel.successors()
               .union(sel.predecessors())
               .union(sel)
               .addClass('highlighted');
        });
    
        cy.$('node').on('mouseout', (e) => {
            const sel = e.target;
            sel.successors()
               .union(sel.predecessors())
               .union(sel)
               .removeClass('highlighted');
        });
        
        cy.$('edge').on('mouseover', (e) => {
            const sel = e.target;
            sel.union(sel.source())
               .union(sel.target())
               .union(sel.target().successors())
               .union(sel.source().predecessors())
               .addClass('highlighted');
        });
        
        cy.$('edge').on('mouseout', (e) => {
            const sel = e.target;
            sel.union(sel.source())
               .union(sel.target())
               .union(sel.target().successors())
               .union(sel.source().predecessors())
               .removeClass('highlighted');
        });
    
        cy.$('node').on('select', (e) => {
            const sel = e.target;
            sel.successors()
               .union(sel.predecessors())
               .union(sel)
               .addClass('selection');
            sel.addClass('main-selection');
        });
        
        cy.$('node').on('unselect', (e) => {
            const sel = e.target;
            sel.successors()
               .union(sel.predecessors())
               .union(sel)
               .removeClass('selection');
            sel.removeClass('main-selection');
        });
        
        cy.$('edge').on('select', (e) => {
            const sel = e.target;
            sel.union(sel.source())
               .union(sel.target())
               .union(sel.target().successors())
               .union(sel.source().predecessors())
               .addClass('selection');
            
            this.showPapersTooltip(sel);
        });
        
        cy.$('edge').on('unselect', (e) => {
            const sel = e.target;
            sel.union(sel.source())
               .union(sel.target())
               .union(sel.target().successors())
               .union(sel.source().predecessors())
               .removeClass('selection');
            this.clearToolTip();
        });
        
        cy.$('edge').on('tap', (e) => {
            const sel = e.target;
            if (!this.tip && sel.selected())
                this.showPapersTooltip(sel);
        });
    }
    
    showPapersTooltip(sel) {
        this.clearToolTip();
        
        // Yeah, this all feels hacky and super un-React, but deal with it
        let content = [...sel.data().papers].map(
            (bibcode) => [bibcode, this.props.repo.docData[bibcode]]);
        content = content.map(
            ([bibcode, data]) => 
                '<div class="graph-tooltip-item">'
                + data.title
                + '<div class="text-muted">'
                + new Date(data.pubdate).getUTCFullYear()
                + `, ${data.publication}&nbsp;&nbsp;`
                + `<a href="${ADSUrl(bibcode)}" target="_blank"`
                + ' rel="noopener noreferrer">[ADS]</a>'
                + '</div></div>'
        );
        
        const paper_plural = content.length === 1 ? '' : 's';
        const verb_plural = content.length === 1 ? 's' : '';
        let heading = `${content.length} paper${paper_plural}`;
        heading += ` connect${verb_plural} `;
        heading += `${sel.data().source} and ${sel.data().target}:`;
        content.unshift(`<p class="graph-tooltip-head">${heading}</p>`);
        
        this.showTooltip(sel, content.join(''))
    }
    
    showTooltip(sel, content) {
        // Per the README of cytoscape.js-popper.
        const ref = sel.popperRef();
        const dummyDomEle = document.createElement('div');
        
        this.tip = new Tippy(dummyDomEle, {
            trigger: 'manual',
            lazy: false,
            onCreate: instance => { instance.popperInstance.reference = ref; },
            onHidden: () => {this.clearToolTip();},
            appendTo: this.cy.container().parentElement,
            interactive: true,
            theme: 'light-border',
            plugins: [sticky],
            sticky: true,
            content: () => {
                const container = document.createElement('div');
                container.innerHTML = content;
                return container;
          }
        });
        this.tip.show();
    }
    
    clearToolTip() {
        if (this.tip) {
            this.tip.destroy();
            delete this.tip;
        }
    }
    
    componentDidUpdate() {
        if (this.cy === undefined)
            return;
        
        const newWidth = this.cy.container().clientWidth;
        const newHeight = this.cy.container().clientHeight;
        
        const dw = (newWidth - this.oldWidth);
        const dh = (newHeight - this.oldHeight);
        
        if (this.oldWidth === 0
            || this.oldHeight === 0
            || newWidth === 0
            || newHeight === 0
            || dw === 0
            || dh === 0)
            return;
        
        this.cy.panBy({x: dw/2, y: dh/2});
        
        this.cy.zoom(this.cy.zoom() * newHeight / this.oldHeight);
        
        this.oldWidth = this.cy.container().clientWidth;
        this.oldHeight = this.cy.container().clientHeight;
    }
    
    componentWillUnmount() {
        delete this.cy;
        delete this.oldHeight;
        delete this.oldWidth;
    }
    
    render() {
        let core = (
            <CytoscapeComponent className="graph-display"
                                // If an empty list isn't provided, a
                                // default set of elements seems to be used
                                elements={[]}
                                autolock={true}
                                autoungrabify={true}
                                boxSelectionEnabled={false}
                                cy={this.onCyRefSet}
                                stylesheet={STYLESHEET}
            >
            </CytoscapeComponent>
        );
        let buttons = (
            <div className="graph-buttons-container">
                <button onClick={this.props.fullScreenHandle.enter}
                   className="graph-enter-fullscreen graph-fullscreen-btn"
                   title="Go full-screen"
                >
                    <ScreenFullIcon size={24} />
                </button>
                
                <button onClick={this.props.fullScreenHandle.exit}
                   className="graph-exit-fullscreen graph-fullscreen-btn"
                   title="Exit full-screen"
                >
                    <ScreenNormalIcon size={24} />
                </button>
            </div>
        )
        
        return (
            <div className="graph">
                <div className="text-muted graph-header-text">
                    Click or hover to highlight, scroll/pinch to zoom, drag to {}
                    move. Size indicates the number of routes through that {}
                    node or edge. Click any connection to view the relevant {}
                    papers.
                </div>
                
                {buttons}
                
                {core}
                
            </div>
        );
    }
    
    buildData(initialWidth, initialHeight) {
        const WIDTH = initialWidth;
        // If we find ourselves with a very tall aspect ratio, don't
        // use it all.
        const HEIGHT = initialHeight < 1.4 * initialWidth
                        ? initialHeight
                        : initialWidth;
        // Leave room for names wider than the nodes
        const HORIZ_BUFFER = 50 * initialWidth / 800;
        const USABLE_WIDTH = WIDTH - 2 * HORIZ_BUFFER;
        const MIN_HORIZ_STEP_SIZE = 125;
        
        const nodes = {};
        const edges = {};
        
        // Width of the graph in nodes
        const nodeWidth = this.props.repo.chains[0].length;
        // `counters` stores a nodeHeight for each column
        const counters = [];
        
        let maxWidth = 1;
        let maxNodeSize = 1;
        
        for (let i=0; i<nodeWidth; i++)
            counters.push(0);
        
        const chains = sortChains('alphabetical', this.props.repo);
        
        // Generate all the nodes
        for (let chain of chains) {
            // eslint-disable-next-line
            chain.forEach((author, i) => {
                const label = this.props.repo.graphTranslation[i][author.toLowerCase()];
                if (!(label in nodes)) {
                    nodes[label] = {
                        data: {id: label, label: label, i: i},
                        position: {
                            x: i,
                            y: counters[i]
                        },
                        style: {width: 1, height: 1}
                    };
                    counters[i]++;
                } else {
                    nodes[label].style.width += 1;
                    nodes[label].style.height += 1;
                    maxNodeSize = Math.max(maxNodeSize, nodes[label].style.width);
                }
            });
        }
        
        // Generate all the edges
        // Display positions are dictated by the node positions. When going
        // through edges, we can use the original, unsorted chains list so
        // we can also access the paper choices for each chain
        this.props.repo.chains.forEach((chain, chainIdx) => {
            const paperChoices = this.props.repo.paperChoicesForChain[chainIdx];
            for (let i=0; i<chain.length - 1; i++) {
                const author = this.props.repo.graphTranslation[i][
                    chain[i].toLowerCase()];
                const nextAuthor = this.props.repo.graphTranslation[i+1][
                    chain[i+1].toLowerCase()];
                let edge;
                if (!(author+nextAuthor in edges)) {
                    edge = {
                        data: {
                            source: author,
                            target: nextAuthor,
                            id: author + " to " + nextAuthor,
                            papers: new Set(),
                        },
                        style: {width: 1}
                    };
                    edges[author + nextAuthor] = edge;
                } else {
                    edge = edges[author + nextAuthor]
                    edge.style.width += 1;
                    maxWidth = Math.max(maxWidth, edge.style.width);
                }
                paperChoices[i].forEach(
                    (paper) => edge.data.papers.add(paper[0]));
            }
        });
        
        // Now that we know how many nodes are in each column, we can
        // properly distribute them.
        let vertOffset = -HEIGHT/2;
        let horizOffset = -WIDTH/2 + HORIZ_BUFFER;
        
        let horizStepSize = USABLE_WIDTH / (nodeWidth - 1);
        if (horizStepSize < MIN_HORIZ_STEP_SIZE)
            horizStepSize = MIN_HORIZ_STEP_SIZE;
        let vertStepSize = counters.map(counter => HEIGHT / (counter + 1));
        
        // Normally, we distribute nodes over the 800px height of the graph.
        // But if that puts nodes in any "column" too close together, we scale
        // up the vertical separations between nodes in every column so text
        // labels don't overlap, and offset everything a constant amount so
        // the src and dest nodes are in the initial view field. The horiz
        // separation also scales to maintain the aspect ratio.
        let scale = 1;
        const maxCount = Math.max(...counters);
        if (HEIGHT / maxCount < 50) {
            scale = 50 / (HEIGHT / maxCount);
            vertOffset = -scale * HEIGHT / 2;
            horizOffset = -scale * USABLE_WIDTH/2;
            vertStepSize = vertStepSize.map(size => scale * size)
            horizStepSize *= scale;
        }
        
        // Redistribute nodes vertically, normalize node sizes
        const elements = Object.values(nodes).map((node, idx) => {
            node.position.y = vertStepSize[node.data.i] * (node.position.y + 1) + vertOffset;
            node.position.x = node.position.x * horizStepSize + horizOffset;
            node.style.width = node.style.width * 30 / maxNodeSize + 10;
            node.style.height = node.style.width;
            return node;
        });
        
        // Normalize edge widths
        const edgesArray = Object.values(edges);
        for (let edge of edgesArray)
            edge.style.width = edge.style.width * 10 / maxWidth + .25;
        
        elements.push(...edgesArray);
        
        let pan = {x: WIDTH/2, y: HEIGHT/2}
        return [elements, 0.95 / scale, pan];
    }
}

const STYLESHEET = [ 
    {
        selector: 'edge',
        style: {
            'target-arrow-color': 'black',
            'line-color': 'black',
            'curve-style': 'straight'
        }
    }, {
        selector: 'node',
        style: {
            label: 'data(label)',
            'text-margin-y': "-5px",
            'text-outline-color': "#FFF",
            'text-outline-opacity': 0.8,
            'text-outline-width': 3,
            'background-color': 'black'
        }
    }, {
        selector: '.selection',
        style: {
            'background-color': 'rgb(0,123,253)',
            'line-color': 'rgb(0,123,253)',
            'target-arrow-color': 'rgb(0,123,253)'
        }
    }, {
        selector: '.highlighted',
        style: {
            'background-color': 'rgb(245,160,64)',
            'line-color': 'rgb(245,160,64)',
            'target-arrow-color': 'rgb(245,160,64)'
        }
    }, {
        selector: '.main-selection',
        style: {
            'z-index': 99999,
        }
    }
];

export default Graph