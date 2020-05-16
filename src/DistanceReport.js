import React from 'react';
import './DistanceReport.css';

function DistanceReport(props) {
    return (
        <div className="distance-report">
            The distance between {}
            <span className="distance-report-name">{props.source}</span>
            {} and {}
            <span className="distance-report-name">{props.dest}</span>
            {} appears to be {}
            <span className="distance-report-distance">{props.dist}</span>.
        </div>
    )
}

export default DistanceReport
