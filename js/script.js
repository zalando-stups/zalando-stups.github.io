$( document ).ready( function() {
    $( '[data-width="full"]' ).css({
        width: $(window).width()
    });
});

var yamlData,
    timeout = false;

function findLinksFor(links, node) {
    return links
            .filter(function(link) {
                return link.source === node  || link.target === node;
            });
}

(function(_, yml, d3) {
    'use strict';
    d3.ns.prefix.xlink = 'http://www.w3.org/1999/xlink';

    yml.load( '/bubbles.yml', render );

    function preprocessLinks( data ) {
        return _.map( data.node_links, function( link ) {
            return {
                source: _.findIndex( data.nodes, { id: link.source }),
                target: _.findIndex( data.nodes, { id: link.target })
            };
        });
    }

    function render( data ) {
        if ( !data.links ) {
            yamlData = data;
        }
        data.links = preprocessLinks( data );
        data.config = data.config || {};

        var WIDTH = $( window ).width(),
            HEIGHT = data.config.height || 600;

        var force = d3.layout.force()
                        .size([ WIDTH, HEIGHT ])
                        .linkDistance( data.config.linkDistance || 120 )
                        .linkStrength( data.config.linkStrength || 0.1 )
                        .friction( data.config.friction || 0.9 )
                        .charge( data.config.charge || -30 )
                        .gravity( data.config.gravity || 0.1 )
                        .theta( data.config.theta || 0.8 )
                        .alpha( data.config.alpha || 0.1 )
                        .nodes( data.nodes )
                        .links( data.links )
                        .start();

        d3.select( '#graph' )
            .select( 'svg' )
            .remove();
        var svg = d3.select( '#graph' )
                    .append( 'svg' )
                        .attr( 'xmlns', 'http://www.w3.org/2000/svg')
                        .attr( 'class', 'graph')
                        .attr( 'width', WIDTH )
                        .attr( 'height', HEIGHT );

        var tip = d3.tip().attr('class', 'd3-tip infobox').html(function(d) {
            var github = d.github ? '<a href="'+d.github+'">Github</a>' : false;
            var docs = d.docs ? '<a href="'+d.docs+'">Documentation</a>' : false;
            var links = '<ul>';
                links += docs ? '<li>'+docs+'</li>' : '';
                links += github ? '<li>'+github+'</li>' : '';
            links += '</ul';
            var aka = '<div>'+d.aka+'</div>'; 
            return  '<div>' +
                        aka +
                        links
                    '</div>';
        });
        svg.call(tip);
        svg.on('click', tip.hide);


        var link = svg.selectAll( '.link' )
                    .data( data.links )
                    .enter()
                        .append( 'line' )
                            .attr( 'id', function(d) { return d.source.id + d.target.id; })
                            .attr( 'class', 'link' );

        var node = svg.selectAll( '.node' )
                    .data( data.nodes )
                    .enter()
                        .append( 'g' )
                        .call( force.drag )
                        .attr( 'id', function(d) {return d.id;})
                        .attr( 'class', 'node' );
        
        node
        .on( 'mouseover', function(d) {
            tip.show(d);
            data.links.forEach(function(d) {
                d3.select('#'+d.source.id+d.target.id).attr('class', 'link');
                    d3.select('#'+d.source.id).attr('class', 'node');
                    d3.select('#'+d.target.id).attr('class', 'node');
            });
            findLinksFor(data.links, d)
                .forEach(function(d) {
                    d3.select('#'+d.source.id+d.target.id).attr('class', 'link is-connected');
                    d3.select('#'+d.source.id).attr('class', 'node is-connected');
                    d3.select('#'+d.target.id).attr('class', 'node is-connected');
                });
            d3.select('#'+d.id).attr('class', 'node is-hovered');
        });

        node
        .on('mouseout', function(dnode) {
            data.links.forEach(function(d) {
                d3.select('#'+d.source.id+d.target.id).attr('class', 'link');
                    d3.select('#'+d.source.id).attr('class', 'node');
                    d3.select('#'+d.target.id).attr('class', 'node');
            });
        });

        node.append( 'circle')
            .attr('class', function(d) { return 'type-'+d.type; })
            .attr( 'r', 30 );
        node.append( 'text' )
                .text( function( d ) { return d.name; });

        force.on( 'tick', function() {
            link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            node.attr( 'transform', function( d ) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        });
    }

    $( window ).resize( function() {
        $( "svg" ).children().remove();
        
        if ( timeout ) {
            clearTimeout( timeout );
            timeout = false;
        }
        timeout = setTimeout( function() {
            (function() {
                console.log( 'rerender!', $(window).width() );
                render( yamlData );
            })();
        }, 100 );
    });

})( _, YAML, d3 );