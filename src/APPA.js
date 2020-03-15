import React from "react";
import parseResponse from "./ServerResponseParser";
import Header from './Header';
import SearchForm from './SearchForm';
import ResultDisplay from "./ResultDisplay";
import './APPA.css';

import Popper from 'popper.js';

// see: https://github.com/twbs/bootstrap/issues/23590
Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;

class APPA extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {isLoading: false, data: null, searchState: null};
        this.onFormSubmitted = this.onFormSubmitted.bind(this);
        this.setStateFromSearchParams = this.setStateFromSearchParams.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
    }
    
    componentDidMount() {
        if (window.location.search.length > 0) {
            this.setStateFromSearchParams(
                new URLSearchParams(window.location.search));
        }
    }
    
    onFormSubmitted(formData) {
        if (formData === null) {
            this.setState({data: null});
            return;
        }
        const params = new URLSearchParams();
        for (let key in formData) {
            if (formData[key] !== '')
                params.set(key, formData[key]);
        }
        this.setStateFromSearchParams(params);
    }
    
    setStateFromSearchParams(params) {
        this.setState({
            searchState: {
                src: params.get("src") || "",
                dest: params.get("dest") || "",
                exclusions: params.get("exclusions") || ""
            }
        });
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        this.setState({haveData: false, isLoading: true});
        fetch("http://127.0.0.1:5000/find_route?" + params.toString())
            .then(response => response.json())
            .then(data => parseResponse(data))
            .then(data => this.setState({
                isLoading: false,
                data: data
            }));
    }
    
    addExclusion(exclusion) {
        let newSearchState = {
            src: this.state.searchState.src,
            dest: this.state.searchState.dest,
            exclusions: this.state.searchState.exclusions || ""
        };
        if (newSearchState.exclusions.length !== 0
            && newSearchState.exclusions.slice(-1) !== '\n')
            newSearchState.exclusions += '\n';
        newSearchState.exclusions += exclusion;
        this.onFormSubmitted(newSearchState);
    }
    
    render() {
        if (!this.state.data && !this.state.isLoading) {
            return (
                <div className="Page">
                    <Header />
                    <div className="MainContent">
                        <SearchForm onSubmit={this.onFormSubmitted}
                                    state={this.state.searchState}
                        />
                    </div>
                </div>
            );
        } else if (this.state.isLoading) {
            return (
                <div className="Page">
                    <Header />
                    <div className="MainContent">
                        Loading...
                    </div>
                </div>
            )
        } else {
            return (
                <div className="Page">
                    <Header />
                    <div className="MainContent">
                        <ResultDisplay repo={this.state.data}
                                       chains={this.state.data.chains}
                                       addExclusion={this.addExclusion}
                                       onEditSearch={() => 
                                           this.onFormSubmitted(null)}
                                       source={this.state.data.originalSource}
                                       dest={this.state.data.originalDest}
                        />
                    </div>
                </div>
            )
        }
    }
}

export default APPA;