import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Spinner from "react-bootstrap/Spinner";
import './Graph.css';

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.buildData = this.buildData.bind(this);
        this.onCyRefSet = this.onCyRefSet.bind(this);
    }
    
    onCyRefSet(cy) {
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
    
        cy.$('node').on('select', (e) => {
            const sel = e.target;
            sel.successors()
                .union(sel.predecessors())
                .union(sel)
                .addClass('selection');
        });
        
        cy.$('node').on('unselect', (e) => {
            const sel = e.target;
            sel.successors()
                .union(sel.predecessors())
                .union(sel)
                .removeClass('selection');
        });
    }
    
    render() {
        let core;
        if (this.props.chains === null)
            core = (
                <h4 style={{textAlign: "center", paddingTop: "20px"}}
                    className="graph-display"
                >
                    Retrieving graph data&nbsp;&nbsp;&nbsp;
                    <Spinner animation="border"
                             variant="primary"
                    />
                    {this.props.loadData()}
                </h4>
            );
        else if (this.props.chains.error)
            core = (
                <h6 style={{textAlign: "center", paddingTop: "20px"}}
                    className="graph-display"
                >
                    Error retrieving graph data. Please reload the page.
                </h6>
            );
        else {
            const [elements, zoom, pan] = this.buildData();
            core = (
                <CytoscapeComponent className="graph-display"
                                    elements={elements}
                                    zoom={zoom}
                                    pan={pan}
                                    autolock={true}
                                    autoungrabify={true}
                                    boxSelectionEnabled={false}
                                    cy={this.onCyRefSet}
                                    stylesheet={STYLESHEET}
                >
                </CytoscapeComponent>
            );
        }
        return (
            <div className="graph">
                <div className="text-muted">
                    Click or hover to highlight, scroll/pinch to zoom, drag to {}
                    move. Size indicates the number of routes through that {}
                    node or edge.
                </div>
                
                {core}
                
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
    
    buildData() {
        const HEIGHT = 800;
        const WIDTH = 836;
        // Leave room for names wider than the nodes
        const HORIZ_BUFFER = 100
        const USABLE_WIDTH = WIDTH - 2 * HORIZ_BUFFER;
        
        const nodes = {};
        const edges = {};
        
        // Width of the graph in nodes
        const nodeWidth = this.props.chains[0].length;
        // `counters` stores a nodeHeight for each column
        const counters = [];
        
        let maxWidth = 1;
        let maxNodeSize = 1;
        
        for (let i=0; i<nodeWidth; i++)
            counters.push(0);
        
        // Generate all the nodes
        for (let chain of this.props.chains) {
            // eslint-disable-next-line
            chain.forEach((author, i) => {
                if (!(author in nodes)) {
                    nodes[author] = {
                        data: {id: author, label: author, i: i,},
                        position: {
                            x: i,
                            y: counters[i]
                        },
                        style: {width: 1, height: 1}
                    };
                    counters[i]++;
                } else {
                    nodes[author].style.width += 1;
                    nodes[author].style.height += 1;
                    maxNodeSize = Math.max(maxNodeSize, nodes[author].style.width);
                }
            });
        }
        
        // Generate all the edges
        for (let chain of this.props.chains) {
            for (let i=0; i<chain.length - 1; i++) {
                const author = chain[i];
                const nextAuthor = chain[i+1];
                if (!(author+nextAuthor in edges)) {
                    edges[author + nextAuthor] = {
                        data: {
                            source: author,
                            target: nextAuthor,
                            id: author + " to " + nextAuthor
                        },
                        style: {width: 1}
                    };
                } else {
                    edges[author + nextAuthor].style.width += 1;
                    maxWidth = Math.max(maxWidth, edges[author + nextAuthor].style.width);
                }
            }
        }
        
        // Now that we know how many nodes are in each column, we can
        // properly distribute them.
        let vertOffset = -HEIGHT/2;
        let horizOffset = -WIDTH/2 + HORIZ_BUFFER;
        
        let horizStepSize = USABLE_WIDTH / (nodeWidth - 1);
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
            'target-arrow-shape': 'triangle',
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
            'text-outline-opacity': 0.7,
            'text-outline-width': 3,
            'background-color': 'black'
        }
    }, {
        selector: '.selection',
        style: {
            'background-color': 'rgb(245,160,64)',
            'line-color': 'rgb(245,160,64)',
            'target-arrow-color': 'rgb(245,160,64)'
        }
    }, {
        selector: '.highlighted',
        style: {
            'background-color': 'rgb(0,123,253)',
            'line-color': 'rgb(0,123,253)',
            'target-arrow-color': 'rgb(0,123,253)'
        }
    }
];

export default Graph