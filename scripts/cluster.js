var cluster = {
    getTipDirection: function(x, y, eleWidth, eleHeight, containerWidth, containerHeight) {
        if (y > containerHeight / 2)
            return 'n';
        if (y < containerHeight / 2)
            return 's';
        return 'n';
    },

    scaling: function(value, vMin, vMax, tMin, tMax, scale) {
        scale = scale || "linear";
        value = value < vMin ? vMin : value;
        value = value > vMax ? vMax : value;
        var result = 0;
        if (scale == "linear")
            result = (value - vMin) / (vMax - vMin) * (tMax - tMin) + tMin;
        else if (scale == "log")
            result = Math.log(value - vMin) / Math.log(vMax - vMin) * (tMax - tMin) + tMin;
        else if (scale == "pow") 
            result = Math.pow(value - vMin, 2) / Math.pow(vMax - vMin, 2) * (tMax - tMin) + tMin;
        else if (scale == "sqrt") 
            result = Math.sqrt(value - vMin) / Math.sqrt(vMax - vMin) * (tMax - tMin) + tMin;
        return result;
    },

    renderGlaxy: function(){
        var self = this;

        d3.csv("./dataProcessed.csv", function(error, data){
            self.data = []
            for(var i = 0; i < data.length; i++){
                self.data[i] = data[i]['姓名']
            } 
        })

        self.widthWhole = $('#galaxy-svg').width();
        self.heightWhole = $('#galaxy-svg').height();
        self.margin = {top: 30, right: 30, bottom: 30, left: 30};
        self.width = self.widthWhole - self.margin.left - self.margin.right;
        self.height = self.heightWhole - self.margin.top - self.margin.bottom;

        self.svg = d3.select("#galaxy-svg").append("svg")
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)

        self.tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]); 
        self.svg.call(self.tip);

        self.dotGroup = self.svg.append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
            .attr("offset-x", self.margin.left)
            .attr("offset-y", self.margin.top)

        self.brush = self._initBrush()

        self.drag = d3.behavior.zoom()
            .on("zoom", function(){ 
                _this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + _this.scale + ")")
            })

        self.svg.append("g")
            .attr("class", "brush")
            .call(self.brush)
    },

    renderDots: function(){
        var self = this;
        var minX = _.min(self.dotPositions, function(d) {return d[0]})[0];
        var maxX = _.max(self.dotPositions, function(d) {return d[0]})[0];
        var minY = _.min(self.dotPositions, function(d) {return d[1]})[1];
        var maxY = _.max(self.dotPositions, function(d) {return d[1]})[1];
       
        self.dotPositions = _.map(self.dotPositions, function(d) {
            return [self.scaling(d[0], minX, maxX, 0, self.width), 
                    self.scaling(d[1], minY, maxY, 0, self.height)];
        })

        if (self.dotGroup.selectAll("g.node-group")[0] == 0) {
            self.dots = self.dotGroup.selectAll("g.node-group")
                .data(self.dotPositions)
                .enter()
                .append("g")
                .attr("class", "node-group")
        }

        self.dots.data(self.dotPositions);
        self.dots.attr("transform", function(d) { return "translate(" + d[0] + "," + d[1] + ")" })
            .attr("id", function(d, i) { return i; })
            .attr("cx", function(d) { return d[0]; })
            .attr("cy", function(d) { return d[1]; })

        self.dots.each(function(d, index) {
            d3.select(this)
                .html("")
                .append("circle")
                .attr("class", "node")
                .attr("r", 5)
                .attr("fill", function() {
                    if(self.label[index] == 0)
                        return "#C6E2FF";
                    if(self.label[index] == 1)
                        return "#AB82FF";
                    if(self.label[index] == 2)
                        return "#00BFFF";
                    if(self.label[index] == 3)
                        return "#FFD700";
                    else
                        return "#FF82AB";
                })                    
                .attr("stroke", "rgba(0, 0, 0, 0.3)")
                .on('mouseover', function() {
                    console.log(d, index)
                    //设置tip
                    var x = d[0], y = d[1];
                    var tip = self.tip;
                    var text = "[" + index + "] " + self.data[index];
                    var dir = self.getTipDirection(x, y, 300, 200, self.width, self.height);
                    tip.html(text).direction("n")
                    var tipEle = d3.select(".graph-tip")
                    tipEle.classed("top", false).classed("bottom", false);
                    if (dir == 'n') tipEle.classed("top", true);
                    if (dir == 's') tipEle.classed("bottom", true);
                    tip.show();

                    table.update(self.data[index]);

                })
                .on('mouseout', function() {
                    self.tip.hide();
                })
        }) 
    },

    getEulerDistancesMatrix: function(vectors) {
        var matrix = [];
        for (var i = 0; i < data.docNum; i++) {
            matrix[i] = [];
            for (var j = 0; j < data.docNum; j++)
                matrix[i][j] = 0;
        }

        if (vectors == null)
            vectors = this.getTFIDFVector();
        for (var i = 0; i < data.docNum; i++) {
            for (var j = 0; j < i; j++) {
                var distance = 0;
                var vec1 = vectors[i],
                    vec2 = vectors[j],
                    termLen = vec1.length;
                for (var k = 0; k < termLen; k++) {
                    distance += (vec1[k] - vec2[k]) * (vec1[k] - vec2[k]);
                }
                distance = Math.sqrt(distance);
                matrix[i][j] = matrix[j][i] = distance;
            }
        }
        console.log(matrix)
        return matrix;
    },

    _initBrush: function() {
        var self = this;

        var brush = d3.svg.brush()
            .x(d3.scale.identity().domain([0, self.widthWhole]))
            .y(d3.scale.identity().domain([0, self.heightWhole]))
            .on("brush", function() {
                self.selectedIDs = [];
                var extent = d3.event.target.extent()
                var offsetX = Number(self.dotGroup.attr("offset-x")), offsetY = Number(self.dotGroup.attr("offset-y"));
                self.svg.selectAll(".node-group").each(function(d, i){
                    if(((extent[0][0]-offsetX)) <= d[0] && d[0] < ((extent[1][0]-offsetX))
                            && ((extent[0][1]-offsetY))  <= d[1] && d[1] < ((extent[1][1]-offsetY))){
                            self.selectedIDs.push(i);
                    }                       
                })
                uncolorAll();
                color(self.selectedIDs);
            })
            .on("brushend", function(){
                if(self.selectedIDs.length){
                    timeline.renderPeoples(self.data, self.selectedIDs)
                    radar.update(self.selectedIDs)
                }
            });

            function color(dotsData) {
                self.svg.selectAll(".node-group").filter(function(d, i){
                    return self.selectedIDs.indexOf(i) < 0;
                })
                .classed("not-selected", true);
                if(self.selectedIDs.length == 0)
                    self.svg.selectAll(".node-group").classed("not-selected", false);
            }

            function uncolorAll() {
                self.svg.selectAll(".node-group").classed("not-selected", false);
            }

        return brush;
    },

    drawGlaxy: function() {
        var self = this;
        self.renderGlaxy();

        var distance ;

        d3.json("./out2.json", function(error, data) {
            self.label = data.result,
            distance = data.matrix
            var worker =new Worker("./libs/tsne/tsne.js");
            worker.postMessage({"cmd":"init", "distance": distance});
            worker.onmessage = async function(event) {
                var data = event.data;
                if (data.message == "running") {
                    self.dotPositions = data.positions;
                    self.renderDots();
                }
            }
        });    
    }
}