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
Graph.prototype.m_altitudeSeries = {data: [], color: '#FF0000'};
Graph.prototype.m_currentDistance = 0.0;
Graph.prototype.m_elevationGain = 0.0;
Graph.prototype.m_elevationLoss = 0.0;

Graph.m_chartOptions = {
    xaxis: {
        label: 'km',
        labelPos: 'high'
    },
    yaxis: {
        label: 'm',
        labelPos: 'high'
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
                chart_height -= $('#graph-page_display').outerHeight( true );
                $( '#graph-page_plot' ).height( chart_height );

                var chart_width = $( '#graph-page > [data-role="content"]' ).width();
                $( '#graph-page_plot' ).width( chart_width );

                pages.graph.m_plot = $.plot($("#graph-page_plot"), [pages.graph.m_altitudeSeries], Graph.m_chartOptions);
                $( '#graph-page_display' ).html( '&uarr; ' + pages.graph.m_elevationGain.toFixed(0) + 'm - &darr; ' + pages.graph.m_elevationLoss.toFixed(0) + 'm' );
            }
            else {
                pages.graph._refresh();
            }
        }

/**
 * Internal function for refreshing the graph display
 */
Graph.prototype._refresh = function() {
            pages.graph.m_plot.setData( [pages.graph.m_altitudeSeries] );
            pages.graph.m_plot.setupGrid();
            pages.graph.m_plot.draw();
            $( '#graph-page_display' ).html( '&uarr; ' + pages.graph.m_elevationGain.toFixed(0) + 'm - &darr; ' + pages.graph.m_elevationLoss.toFixed(0) + 'm' );
        }

/**
 * Called when a new track should be started (thus reset the graph)
 */
Graph.prototype.newtrack = function() {
            pages.graph.m_altitudeSeries.data = [];
            pages.graph.m_currentDistance = 0.0;
            pages.graph.m_elevationGain = 0.0;
            pages.graph.m_elevationLoss = 0.0;
        }

/**
 * Add a new waypoint to the altitude graph
 */
Graph.prototype.waypoint = function( p_waypoint, p_track ) {
            pages.graph.m_currentDistance += parseFloat(p_waypoint.m_distance / 1000.0);
            var alt = parseFloat(p_waypoint.m_position.coords.altitude);

            pages.graph.m_altitudeSeries.data.push( [pages.graph.m_currentDistance, alt] );

            pages.graph.m_elevationGain = p_track.getElevationGain();
            pages.graph.m_elevationLoss = p_track.getElevationLoss();

            if( pages.graph.m_altitudeChart !== null && $( '#graph-page' ).is( ':visible' ) ) {
                pages.graph._refresh();
            }
        }

/**
 * Finalize the track (no action required in this case)
 */
Graph.prototype.endtrack = function( p_track ) {
            pages.graph.m_elevationGain = p_track.getElevationGain();
            pages.graph.m_elevationLoss = p_track.getElevationLoss();

            if( $( '#graph-page' ).is( ':visible' ) ) {
                pages.graph._refresh();
            }
        }

new Graph();
