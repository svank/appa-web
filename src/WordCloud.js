import React from 'react';
import {Button, Form} from "react-bootstrap";
import D3WordCloud from 'react-d3-cloud';
import './WordCloud.css';

class WordCloud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keywords: true,
            titles: true,
            coauthors: false,
            journals: false,
            sizeScale: 50,
            padding: 1.5,
            excludedWords: "a, an, and, at, by, for, in, of, on, or, so, the",
            rotate: true,
            rotateOnly90: true,
            color: true,
            shouldRender: false,
            cloudUpdateKey: 0
        };
        
        this.getWords = this.getWords.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
        this.onSizeScaleChange = this.onSizeScaleChange.bind(this);
        this.onPaddingChange = this.onPaddingChange.bind(this);
        this.onApply = this.onApply.bind(this);
        this.saveAsPNG = this.saveAsPNG.bind(this);
        this.rotationMapper = this.rotationMapper.bind(this);
        this.onExcludedWordsChange = this.onExcludedWordsChange.bind(this);
    }
    
    onCheckboxChange(event) {
        const name = event.target.name;
        const checked = event.target.checked;
        this.setState({[name]: checked, shouldRender: name==="color"});
    }
    
    onSizeScaleChange(event) {
        this.setState({sizeScale: event.target.value * .8 + 20});
    }
    
    onPaddingChange(event) {
        this.setState({padding: event.target.value * 1.5 / 5 / 10});
    }
    
    onApply(event) {
        event.preventDefault();
        this.setState({
            shouldRender: false
        });
    }
    
    onExcludedWordsChange(event) {
        this.setState({excludedWords: event.target.value});
    }
    
    fontSizeMapper = word => (Math.log2(word.value) / 3 + .5) * this.state.sizeScale/2;
    
    rotationMapper() {
        if (!this.state.rotate)
            return 0;
        if (!this.state.rotateOnly90)
            return Math.random() * 120 - 60;
        return Math.round(Math.random()) * -90;
    }
    
    render() {
        let className = "WordCloud";
        if (!this.state.color)
            className += " WordCloudNoColor";
        const output = (
            <div className={className}>
                <div className="WordCloudControls">
                    <div className="WordCloudSourceControlBox">
                        <div>Of the papers linking these authors, {}
                        use words from:</div>
                        <Form.Check type="switch"
                                    id="titles"
                                    name="titles"
                                    label="Article titles"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.titles}
                        />
                        <Form.Check type="switch"
                                    id="keywords"
                                    name="keywords"
                                    label="Article keywords"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.keywords}
                        />
                        <Form.Check type="switch"
                                    id="coauthors"
                                    name="coauthors"
                                    label="Coauthor names"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.coauthors}
                        />
                        <Form.Check type="switch"
                                    id="journals"
                                    name="journals"
                                    label="Journal names"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.journals}
                        />
                    </div>
                    <div className="WordCloudMiscControlsBox">
                        <Form.Check type="switch"
                                    id="rotate"
                                    name="rotate"
                                    label="Randomly rotate words"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.rotate}
                        />
                        <Form.Check type="switch"
                                    id="rotateOnly90"
                                    name="rotateOnly90"
                                    label="Only use right angles"
                                    disabled={!this.state.rotate}
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.rotateOnly90}
                                    style={{marginLeft: "15px"}}
                        />
                        <Form.Check type="switch"
                                    id="color"
                                    name="color"
                                    label="Color text"
                                    onChange={this.onCheckboxChange}
                                    checked={this.state.color}
                        />
                        <div className="WordCloudControlButtons">
                            <Button variant="primary"
                                    onClick={() => this.setState(
                                        {shouldRender: false})}
                            >
                                Shuffle Cloud
                            </Button>
                            <Button variant="primary"
                                    onClick={this.saveAsPNG}
                            >
                                Save as Image
                            </Button>
                        </div>
                    </div>
                    <div className="WordCloudSizeControlBox">
                        <Form onSubmit={this.onApply}>
                            <div>Word size scale:</div>
                            <Form.Control type="range"
                                          onChange={this.onSizeScaleChange}
                                          className="custom-range"
                            />
                            <div>Space between words:</div>
                            <Form.Control type="range"
                                          onChange={this.onPaddingChange}
                                          className="custom-range"
                            />
                            Exclude words:
                            <Form.Control type="input"
                                          id="excludedWords"
                                          name="excludedWords"
                                          value={this.state.excludedWords}
                                          onChange={this.onExcludedWordsChange}
                            />
                            <Button variant="primary"
                                    size="sm"
                                    style={{marginTop: "8px"}}
                                    type="submit"
                            >
                                Apply
                            </Button>
                        </Form>
                    </div>
                </div>
                
                {// The WordCloud Component takes a few beats to render.
                 // Together with the timeout set at the end of this
                 // function, this switch here ensures the word cloud doesn't
                 // render until the tab is visible, and ensures a
                 // "Rendering..." message appears while the cloud renders.
    
                this.state.shouldRender
                    ? <D3WordCloudWrapper
                        data={this.getWords()}
                        fontSizeMapper={this.fontSizeMapper}
                        rotate={this.rotationMapper}
                        width={825}
                        height={600}
                        padding={this.state.padding}
                        updateKey={this.state.cloudUpdateKey}
                      />
                    : <h3 style={{width: 825, height: 600}}>
                        Rendering...
                      </h3> }
                
                <canvas id="renderCanvas" style={{display: "none"}}/>
                
                <div className="WordCloudFooter text-muted">
                    Generated with {}
                    <a target="_blank" rel="noopener"
                       href="https://github.com/Yoctol/react-d3-cloud">
                        react-d3-cloud
                    </a>, {}
                    <a target="_blank" rel="noopener"
                       href="https://github.com/jasondavies/d3-cloud">
                        d3-cloud
                    </a>, and {}
                    <a target="_blank" rel="noopener"
                       href="https://github.com/d3/d3">d3</a>.
                </div>
            </div>
        );
        if (this.props.active && !this.state.shouldRender)
            // Allow the controls and a "Rendering..." message to render before
            // the word cloud bogs down the render thread
            setTimeout(() => this.setState(
                {shouldRender: true,
                      cloudUpdateKey: this.state.cloudUpdateKey+1}), 
                100);
        return output;
    }
    
    saveAsPNG() {
        // Coming from https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
        let svg = document.querySelector('.WordCloud > div > svg');
        let canvas = document.querySelector('#renderCanvas');
        canvas.width = 1650;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        let data = (new XMLSerializer()).serializeToString(svg);
        const DOMURL = window.URL || window.webkitURL || window;
        
        const img = new Image();
        img.width = 1650;
        img.height = 1200;
        data = data.replace("<svg", '<svg viewBox="0 0 825 600"');
        data = data.replace('width="825"', 'width="1650"');
        data = data.replace('height="600"', 'height="1200"');
        if (!this.state.color)
            data = data.replace(/rgb\(\d+, \d+, \d+\)/g, "rgb(0, 0, 0)");
        
        const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        const url = DOMURL.createObjectURL(svgBlob);
        
        img.onload = function () {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);
        
            const imgURI = canvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');
        
            const evt = new MouseEvent('click', {
                view: window,
                bubbles: false,
                cancelable: true
            });
        
            const a = document.createElement('a');
            a.setAttribute('download', 'wordcloud.png');
            a.setAttribute('href', imgURI);
            a.setAttribute('target', '_blank');
        
            a.dispatchEvent(evt);
        };
        img.src = url;
    }
    
    getWords() {
        const excludedWords = this.state.excludedWords.split(",").map(
            word => word.trim().toLowerCase());
        const words = {};
        for (const data of Object.values(this.props.repo.docData)) {
            const wordsFromDoc = [];
            if (this.state.keywords && data.keywords !== null) {
                for (const keyword of data.keywords)
                    wordsFromDoc.push(...keyword.split(" "));
            }
            
            if (this.state.titles && data.title !== null)
                wordsFromDoc.push(...data.title.split(" "));
            
            if (this.state.coauthors && data.authors !== null) {
                for (const coauthor of data.authors)
                    wordsFromDoc.push(...coauthor.split(" "));
            }
            
            if (this.state.journals && data.publication !== null)
                wordsFromDoc.push(data.publication);
            
            for (let subword of wordsFromDoc) {
                subword = trimPunctuationAndExcludedWords(subword, excludedWords);
                if (subword === "")
                    continue;
                if (subword in words)
                    words[subword] += 1;
                else
                    words[subword] = 1;
            }
        }
        const wordData = [];
        for (const word in words)
            wordData.push({text: word, value: words[word]});
        return wordData;
    }
}

class D3WordCloudWrapper extends React.Component{
    // A small wrapper that allows the existing word cloud to be shown without
    // re-rendering it every time the parent's state changes.
    constructor(props) {
        super(props);
        this.state = {key: props.updateKey};
    }
    
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.updateKey > this.state.updateKey) {
            this.setState({updateKey: nextProps.updateKey});
            return true;
        }
        return false;
    }
    
    render() {
        return <D3WordCloud
                        data={this.props.data}
                        fontSizeMapper={this.props.fontSizeMapper}
                        rotate={this.props.rotate}
                        width={this.props.width}
                        height={this.props.height}
                        padding={this.props.padding}
               />
    }
}

function trimPunctuationAndExcludedWords(word, excludedWords) {
    word = word.replace(/^[,.\-:"'()]+|[,.\-:"'()]+$/g, '');
    if (word.length === 1 || excludedWords.includes(word.toLowerCase()))
        return '';
    return word;
}

export default WordCloud