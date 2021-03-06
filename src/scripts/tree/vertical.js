/**
 * Created by liujiwen on 2016-10-14.
 */
function verticalTree(domId, root, divWidth, divHeight) {
    var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    };
    divWidth = divWidth | 960 ;
    divHeight = divHeight | 600;
    var width = divWidth - margin.right - margin.left;
    var height = divHeight - margin.top - margin.bottom;

    //var root = {name: "crazywen", children: [{name: "son"}, {name: "ddd"}]};

    var i = 0, duration = 750, rectW = 70, rectH = 30;

    var tree = d3.layout.tree().size([height, width]);//nodeSize([100, 40]);
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });


    var svg = d3.select("#"+domId).append("svg").attr("width", divWidth).attr("height", divHeight)
        .call(zm = d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", redraw)).append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//necessary so that zoom knows where to zoom and unzoom from
    zm.translate([margin.left, margin.top]);

    root.x0 = height / 2 ;
    root.y0 = 0 ;

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    root.children.forEach(collapse);
    update(root);

    d3.select("#"+domId).style("height", divHeight + "px");

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        // Update the nodes��
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        //nodeEnter.append("rect")
        //    .attr("width", function(d){
        //            return rectW;
        //    })
        //    .attr("height", rectH)
        //    .attr("stroke", "black")
        //    .attr("stroke-width", 1)
        //    .style("fill", function (d) {
        //        return d._children ? "lightsteelblue" : "#fff";
        //    });

        //nodeEnter.append("text")
        //    .attr("x", rectW / 2)
        //    .attr("y", rectH / 2)
        //    .attr("dy", ".35em")
        //    .attr("text-anchor", "middle")
        //    .style("width", "1.5em")
        //    .style("float", "right")
        //    .text(function (d) {
        //        return d.name;
        //    });

        nodeEnter.append("text")
            .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
            .text(function(d) { return d.name; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        //nodeUpdate.select("rect")
        //    .attr("width", rectW)
        //    .attr("height", rectH)
        //    .attr("stroke", "black")
        //    .attr("stroke-width", 1)
        //    .style("fill", function (d) {
        //        return d._children ? "lightsteelblue" : "#fff";
        //    });
        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        //nodeExit.select("rect")
        //    .attr("width", rectW)
        //    .attr("height", rectH)
        //    //.attr("width", bbox.getBBox().width)""
        //    //.attr("height", bbox.getBBox().height)
        //    .attr("stroke", "black")
        //    .attr("stroke-width", 1);
        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        //nodeExit.select("text");

        // Update the links��
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

// Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

//Redraw for zoom
    function redraw() {
        //console.log("here", d3.event.translate, d3.event.scale);
        svg.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
    }

    return svg;
}