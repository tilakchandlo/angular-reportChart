(function() {
    'use strict';  angular.module('angular-radar', []).directive('radarChart', function () {
        var colorFunction = function(i) {
            var colorArray = ['#389C75', '#FEFEFE', '#DFD122', '#3668A4', '#753790'];
                return colorArray[2];
        }
        var initConfig = {
             factor: .7,
             factorLegend: .85,
             levels: 3,
             maxValue: 0,
             radians: 2 * Math.PI,
             opacityArea: .7,
             // color: colorFunction,
             fontSize: 12
        };
        return {
        restrict: 'E',
          scope: {
            val: '=',
            width: '=',
            height: '=',
            levels: '=',
            initcolor: '='
          },
        link: function (scope, element, attrs) {
            var margin = {
              left: 5,
              top: 5,
              bottom: 5,
              right: 5
            };
            scope.render = function(data) {
              initConfig.color = scope.initcolor;
              initConfig.h = element[ 0 ].parentElement.offsetHeight - ( margin.top + margin.bottom );
              initConfig.w = initConfig.h;
              initConfig.maxValue = Math.max(d3.max(data, function(i){return d3.max(i.map(function(o){return o.value*1.1;}))}));
              var allAxis = (data[0].map(function(i, j){return i.axis}));
              var total = allAxis.length;
              var radius = initConfig.factor*Math.min(initConfig.w/2, initConfig.h/2);
              d3.select(element[0]).select("svg").remove();
              var gRadar = d3.select(element[0]).append("svg").attr("width", initConfig.w).attr("height", initConfig.h).append("g");
              function getPosition(i, range, factor, func){
                factor = typeof factor !== 'undefined' ? factor : 1;
                return range * (1 - factor * func(i * initConfig.radians / total));
              }
              function getHorizontalPosition(i, range, factor){
                return getPosition(i, range, factor, Math.sin);
              }
              function getVerticalPosition(i, range, factor){
                return getPosition(i, range, factor, Math.cos);
              }
               /*Draw Outer Line*/
              for(var j=0; j<initConfig.levels; j++){
                var levelFactor = radius*((j+1)/initConfig.levels);
                var drawBasic = gRadar.selectAll(".levels").data(allAxis).enter().append("svg:line")
                   .attr("x1", function(d, i){return getHorizontalPosition(i, levelFactor);})
                   .attr("y1", function(d, i){return getVerticalPosition(i, levelFactor);})
                   .attr("x2", function(d, i){return getHorizontalPosition(i+1, levelFactor);})
                   .attr("y2", function(d, i){return getVerticalPosition(i+1, levelFactor);});
                if(j===initConfig.levels-1){
                   drawBasic.attr("class", "line").style("stroke", "#fff").attr("transform", "translate(" + (initConfig.w/2-levelFactor) + ", " + (initConfig.h/2-levelFactor) + ")");
                }
                else{
                   drawBasic.attr("class", "line").style("stroke", "#fff").style("stroke-dasharray", ("3, 3")).attr("transform", "translate(" + (initConfig.w/2-levelFactor) + ", " + (initConfig.h/2-levelFactor) + ")");
                }
              }

              /*Draw Text*/
              var axis = gRadar.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
              axis.append("text").attr("class", "legend")
                  .text(function(d){return d})
                  .style("font-family", "Verdana").style("font-size", initConfig.fontSize + "px")
                  .style("fill","#FFF")
                  .style("text-anchor", "middle")
                  .attr("transform", function(d, i){
                    var p = getVerticalPosition(i, initConfig.h / 2);
                    return p < initConfig.fontSize ? "translate(0, " + (initConfig.fontSize - p) + ")" : "";
                  })
                  .attr("x", function(d, i){return getHorizontalPosition(i, initConfig.w / 2, initConfig.factorLegend);})
                  .attr("y", function(d, i){return getVerticalPosition(i, initConfig.h / 2, initConfig.factorLegend);});

              /*Draw Area*/
              var series = 0;
              data.forEach(function(y, x){
                var dataValues = [];
                gRadar.selectAll(".nodes")
                  .data(y, function(j, i){
                    dataValues.push([
                      getHorizontalPosition(i, initConfig.w/2, (parseFloat(Math.max(j.value, 0))/initConfig.maxValue)*initConfig.factor),
                      getVerticalPosition(i, initConfig.h/2, (parseFloat(Math.max(j.value, 0))/initConfig.maxValue)*initConfig.factor)
                    ]);
                  });
                dataValues.push(dataValues[0]);
                gRadar.selectAll(".area")
                   .data([dataValues])
                   .enter()
                   .append("polygon")
                   .attr("class", "radar-chart-serie"+series)
                   .attr("points",function(d) {
                       var str="";
                       for(var pti=0;pti<d.length;pti++){
                           str=str+d[pti][0]+","+d[pti][1]+" ";
                       }
                       return str;
                    })
                   .style("fill", function(j, i){return initConfig.color})
                   .style("fill-opacity", initConfig.opacityArea)
                   .on('mouseover', function (d){
                                      var z = "polygon."+d3.select(this).attr("class");
                                      gRadar.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                                      gRadar.selectAll(z).transition(200).style("fill-opacity", .9);
                                    })
                   .on('mouseout', function(){
                                      gRadar.selectAll("polygon").transition(200).style("fill-opacity", initConfig.opacityArea);
                   });
                series++;
              });
            }
            scope.$watch('val', function(){
              scope.render(scope.val);
            }, true);
        }
        };
});
}).call(this);
