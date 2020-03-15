import React from 'react';
import {Button, Form} from 'react-bootstrap';
import './SearchForm.css';

class SearchForm extends React.Component {
    constructor(props) {
        super(props);
        if (props.state === null)
            this.state = {
                src: '',
                dest: '',
                exclusions: ''
            };
        else
            this.state = {
                src: props.state.src,
                dest: props.state.dest,
                exclusions: props.state.exclusions
            };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onClear = this.onClear.bind(this);
    }
    
    onSubmit(event) {
        event.preventDefault();
        this.props.onSubmit({
            src: this.state.src,
            dest: this.state.dest,
            exclusions: this.state.exclusions
        });
    }
    
    onChange(event) {
        event.preventDefault();
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({[name]: value})
    }
    
    onClear(event) {
        event.preventDefault();
        this.props.onSubmit(null);
    }
    
    render() {
        if (this.props.mini) {
            return (
                <div className="SearchFormEditSearch">
                    <Button variant="link"
                            onClick={this.onClear}
                    >
                        <span className="SearchFormLeftArrow" /> Edit search
                    </Button>
                </div>
            )
        }
        return (
            <div>
                <Form className="SearchForm"
                      onSubmit={this.onSubmit}
                >
                    <Form.Group controlId="src">
                        <Form.Label>
                            Search for a link between this author
                        </Form.Label>
                        <Form.Control type="text"
                                      onChange={this.onChange}
                                      name="src"
                                      value={this.state.src}
                                      placeholder="Last, First Middle"
                        />
                    </Form.Group>
                    <img src="arrow.png"
                         className="SearchFormArrowPart"
                         alt=""
                    />
                    <Form.Group controlId="dest">
                        <Form.Label>
                            and this author
                        </Form.Label>
                        <Form.Control type="text"
                                      onChange={this.onChange}
                                      name="dest"
                                      value={this.state.dest}
                                      placeholder="Last, First Middle"
                        />
                    </Form.Group>
                    
                    <Form.Group controlId="excluding">
                        <Form.Label>
                            Excluding these
                        </Form.Label>
                        <Form.Control as="textarea"
                                      rows="3"
                                      onChange={this.onChange}
                                      name="exclusions"
                                      value={this.state.exclusions}
                        />
                        <Form.Text className="text-muted">
                            Enter author names or bibcodes to ignore, one {}
                            per line.
                        </Form.Text>
                    </Form.Group>
                    <Button type="submit" variant="primary">
                        Search!
                    </Button>
                </Form>
            </div>
        )
    }
}

export default SearchForm