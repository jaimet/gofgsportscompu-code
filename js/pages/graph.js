/*
 * Copyright (C) 2012 Wolfgang Koller
 *
 * This file is part of GOFG Sports Computer - http://www.gofg.at/.
 *
 * GOFG Sports Computer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GOFG Sports Computer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GOFG Sports Computer.  If not, see <http://www.gnu.org/licenses/>.
 */

function Graph() {
}
Graph.prototype = new Page( 'graph' );

Graph.prototype.leftPage = "map.html";
Graph.prototype.m_plot = null;
Graph.prototype.m_altitudeValues = [];
Graph.prototype.m_currentDistance = 0.0;

Graph.m_chartOptions = {
    axesDefaults: {
        pad:1.0,
        tickOptions: {
            mark: 'cross'
        }
    },
    axes: {
        xaxis: {
            label: 'km'
        },
        yaxis: {
            label: 'm'
        }
    },
    seriesDefaults: {
        color: '#FF0000',
        showMarker: false
    },
    grid: {
        background: '#F0F0F0'
    }
};

Graph.prototype.oninit = function() {
            $( '#graph-page' ).live( 'pageshow', Utilities.getEvtHandler(pages.graph, pages.graph.initChart) );
        }

/**
 * Called whenever the chart is shown (which initialized the chart & updates the display)
 */
Graph.prototype.initChart = function() {
            if( pages.graph.m_plot === null ) {
                // Calculate and setup chart height
                var chart_height = $(window).height();
                chart_height -= $('#graph-page > [data-role="header"]').outerHeight( true );
                chart_height -= ($( '#graph-page > [data-role="content"]' ).outerHeight( true ) - $( '#graph-page > [data-role="content"]' ).height());
                chart_height -= $('#graph-page_pager').outerHeight( true );
                $( '#graph-page_plot' ).height( chart_height );

                var initValues = pages.graph.m_altitudeValues;
                if( initValues.length <= 0 ) initValues = [[]];

                pages.graph.m_plot = $.jqplot(
                            'graph-page_plot',
                            [initValues],
                            Graph.m_chartOptions
                            );
            }
            else {
                pages.graph.m_plot.series[0].data = pages.graph.m_altitudeValues;
                pages.graph.m_plot.replot({resetAxes:true});
            }
        }

/**
 * Called when a new track should be started (thus reset the graph)
 */
Graph.prototype.newtrack = function() {
            pages.graph.m_altitudeValues = [];
            pages.graph.m_currentDistance = 0.0;
        }

/**
 * Add a new waypoint to the altitude graph
 */
Graph.prototype.waypoint = function( p_waypoint ) {
            pages.graph.m_currentDistance += parseFloat(p_waypoint.m_distance / 1000.0);
            var alt = parseFloat(p_waypoint.m_position.coords.altitude);

            pages.graph.m_altitudeValues.push( [pages.graph.m_currentDistance, alt] );

            if( pages.graph.m_altitudeChart !== null && $( '#graph-page' ).is( ':visible' ) ) {
                pages.graph.m_altitudeChart.series[0].data = pages.graph.m_altitudeValues;
                pages.graph.m_altitudeChart.replot({resetAxes:true});
            }
        }

/**
 * Finalize the track (no action required in this case)
 */
Graph.prototype.endtrack = function() {}

new Graph();
