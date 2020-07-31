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
        return (
            <div className="graph">
                <div className="text-muted">
                    Click or hover to highlight, scroll/pinch to zoom, drag to {}
                    move. Size indicates the number of routes through that {}
                    node or edge.
                </div>
                {this.props.chains === null ?
                    <h4 style={{textAlign: "center", paddingTop: "20px"}}
                          className="graph-display"
                      >
                        Retrieving graph data&nbsp;&nbsp;&nbsp;
                        <Spinner animation="border"
                                 variant="primary"
                        />
                        {this.props.loadData()}
                      </h4>
                    : this.props.chains.error ?
                        <h6 style={{textAlign: "center", paddingTop: "20px"}}
                          className="graph-display"
                      >
                        Error retrieving graph data. Please reload the page.
                      </h6>
                    :
                    <CytoscapeComponent className="graph-display"
                                        elements={this.buildData()}
                                        autolock={true}
                                        autoungrabify={true}
                                        boxSelectionEnabled={false}
                                        cy={this.onCyRefSet}
                                        stylesheet={STYLESHEET}
                    >
                    </CytoscapeComponent>
                }
                
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
        const nodes = {};
        const edges = {};
        const nodeWidth = this.props.chains[0].length;
        
        const horizStepSize = 635 / (nodeWidth - 1);
        const horizOffset = 100;
        
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
                            x: horizStepSize * i + horizOffset,
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
        
        // Normally, we distribute nodes over the 800px height of the graph.
        // But if that puts nodes in any "column" too close together, we scale
        // up the vertical separations between nodes in every column so text
        // labels don't overlap, and offset everything a constant amount so
        // the src and dest nodes are in the initial view field.
        const maxCount = Math.max(...counters);
        let posMult = 1;
        let posOff = 0;
        if (800 / maxCount < 50) {
            posMult = 50 / (800 / maxCount);
            posOff = (posMult - 1) * 800 / 2;
        }
        
        // Redistribute nodes vertically, normalize node sizes
        const elements = Object.values(nodes).map((node, idx) => {
            node.position.y = 800 / (counters[node.data.i]+1) * (node.position.y+1) * posMult - posOff;
            node.style.width = node.style.width * 30 / maxNodeSize + 10;
            node.style.height = node.style.width;
            return node;
        });
        
        // Normalize edge widths
        const edgesArray = Object.values(edges);
        for (let edge of edgesArray)
            edge.style.width = edge.style.width * 10 / maxWidth + .25;
        
        elements.push(...edgesArray);
        return elements;
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