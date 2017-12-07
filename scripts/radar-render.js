var radar = {	
	initialize: function(){
		self = this;
		
		self.widthWhole = $('#statisticsInfo').width(),
		self.heightWhole = $('#statisticsInfo').height(),
		self.margin = {top: 50, right: 50, bottom: 50, left: 50},
		self.width = self.widthWhole - self.margin.left - self.margin.right,
		self.height = self.heightWhole - self.margin.top - self.margin.bottom,
		
		self.color = d3.scale.ordinal().range(["#EDC951","#CC333F","#00A0B0"]);

		self.radarChartOptions = {
			w: Math.min(self.width, self.height),
			h: Math.min(self.width, self.height),
			margin: self.margin,
			maxValue: 1,
			levels: 5,
			roundStrokes: true,
			color: self.color
		};

		var dataNum =  {
			"sex": 2,
			"people": 11,
			"place": 29,
			"school": 89,
			"background": 83,
			'age': 0.11
		};
		self.renderRadarChart(dataNum)

	},
	renderRadarChart: function(dataNum){
		var self = this;

		var data = [
			[//性别 民族 出生地 毕业院校 专业背景 担任职务 年龄
				{axis:"性别",value:(dataNum.sex-1)/2.0}, //2  type number
				{axis:"民族",value:dataNum.people/11.0}, //11  type number
				{axis:"出生地",value:dataNum.place/29.0},  //29 type number
				{axis:"毕业院校",value:dataNum.school/89}, //89 type number
				{axis:"专业背景",value:dataNum.background/83}, // 83 type number 
				{axis:"年龄",value:dataNum.age}	//mean age	
			]
		];
		//Call function to draw the Radar chart
		RadarChart("#statisticsInfo", data, self.radarChartOptions);
	},

 	variance: function(numbers) { 
 		var self = this;

	    var mean = 0;  
	    var sum = 0;  
	    for(var i=0;i<numbers.length;i++){  
	        sum += numbers[i];  
	    }  
	    mean = sum / numbers.length;  
	    sum = 0;  
	    for(var i=0;i<numbers.length;i++){  
	        sum += Math.pow(numbers[i] - mean , 2);  
	    }  
	    return sum / numbers.length / 100;  
	},

	update: function(selectedIDs){
		var sexMap = new Map(),
			peopleMap = new Map(),
			placeMap = new Map(),
			schoolMap = new Map(),
			backgroundMap = new Map(),
			age = [];

		d3.csv("./dataProcessed.csv", function(error, dataSet){
            for(var i = 0; i < selectedIDs.length; i++){
				data = dataSet[i];
				if(!(data['性别'] in sexMap)){
					sexMap.set(data['性别'], 0);
				}
				if(!(data['民族'] in peopleMap)){
					peopleMap.set(data['民族'], 0);
				}
				if(!(data['出生地'] in placeMap)){
					placeMap.set(data['出生地'], 0);
				}
				if(!(data['毕业院校'] in schoolMap)){
					schoolMap.set(data['毕业院校'], 0);
				}
				if(!(data['专业背景'] in backgroundMap)){
					backgroundMap.set(data['专业背景'], 0);
				}
				age.push(parseInt(data['年龄']));
			}
			console.log(sexMap.size, peopleMap.size, placeMap.size, schoolMap.size, backgroundMap.size, age); 
			var dataNum =  {
				"sex": sexMap.size,
				"people": peopleMap.size,
				"place":  placeMap.size,
				"school": schoolMap.size,
				"background": backgroundMap.size,
				'age': self.variance(age)
			};
			self.renderRadarChart(dataNum)

        })

		
	}
}




