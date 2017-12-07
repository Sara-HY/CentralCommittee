var timeline = {
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

	renderRec: function(start, end, name, y){
		var self = this;

		var x1 = self.scaling(start, self.minYear, self.maxYear, 0, self.width),
			x2 = self.scaling(end, self.minYear, self.maxYear, 0, self.width);

		self.timeline = self.svg.append("g")
			.attr("class", "people")
            
        self.timeline.append("rect")
            .attr('x', function(){
            	return x1 + self.margin.left;
            })
            .attr('y', function(){
            	return self.margin.top + y.length * 30;
            })
            .attr('id', y.length)
            .attr("height", "10")
            .attr("width", function(){
            	return x2 - x1;
            })
            .attr("fill", "#F4A460")
            .attr("cursor", "pointer")
            .on("click", function(d, i){
                console.log(d3.select(this)[0][0]['id'], name)
                table.update(name[d3.select(this)[0][0]['id'] - 1]);
            })
        
        self.timeline.append("text")
            .attr("x", function(){
                return x1 + self.margin.left;
            })
            .attr("y", function() {
                return self.margin.top + y.length * 30;
            })
            .text(name[y.length - 1]);
	},

	initialize: function(){
		var self = this;

		self.widthWhole = $('#peopleTimeline').width();
        self.heightWhole = $('#peopleTimeline').height();
        self.margin = {top: 30, right: 30, bottom: 30, left: 30};

        self.width = self.widthWhole - self.margin.left - self.margin.right;
        self.height = self.heightWhole - self.margin.top - self.margin.bottom;

		self.minYear = 1950;
		self.maxYear = 2020;

		self.svg = d3.select("#peopleTimeline").append("svg")
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)

        self.timeline = self.svg.append("g")
        	.attr("width", self.width)
            .attr("height", "100%")
            .attr("offset-x", self.margin.left)
            .attr("offset-y", self.margin.top)

        var self = this;

		var x1 = self.scaling(self.minYear, self.minYear, self.maxYear, 0, self.width),
			x2 = self.scaling(self.maxYear, self.minYear, self.maxYear, 0, self.width);

		self.timeline = self.svg.append("g")
            
        self.timeline.append("rect")
            .attr('x', function(){
            	return x1 + self.margin.left;
            })
            .attr('y', function(){
            	return self.margin.top;
            })
            .attr("height", "10")
            .attr("width", function(){
            	return x2 - x1;
            })
            .attr("fill", "#E6E6FA");

        timelist = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]

        for(var i = 0; i < timelist.length; i++){
        	var x = self.scaling(timelist[i], self.minYear, self.maxYear, 0, self.width)
        	
        	self.timeline.append("text")
            	.attr("x", function(){
            		return x + self.margin.left - 15;
            	})
            	.attr("y", function() {
            		return self.margin.top + 10;
            	})
            	.text(timelist[i])
        }
	},

	renderPeoples: function(data, selectedIDs){
		var self = this;

		d3.selectAll(".people").remove()
		var y = [], name = [];
		for(var i = 0; i < selectedIDs.length; i++){
            name.push(data[selectedIDs[i]]),
                filePath = "./data/" + data[selectedIDs[i]] + ".csv";
			d3.csv(filePath, function(error, csvdata){
	            if(error){  
	                console.log(error);  
	            }

	           	var start = (csvdata[0]['time']).substring(0, 4),
	           		end = (csvdata[csvdata.length-1]['time']).substring(0, 4);
           		y.push(i);
           		self.renderRec(start, end, name, y);	           	
	        });
		}
	}
}